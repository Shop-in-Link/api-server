import { SchemaDirectiveVisitor, AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { defaultFieldResolver, GraphQLField, GraphQLInterfaceType, GraphQLObjectType } from 'graphql';

import User, { IUser } from '../../models/user';
import { ITokenPayload } from '../../utils/TokenPayload';

/**
 * This class implements Auth directive.
 * The Auth directive restricts queries that can be accessed based on the user's role.
 */
export class AuthDirective extends SchemaDirectiveVisitor {
    visitObject(object: GraphQLObjectType): GraphQLObjectType | void | null {
        this.ensureFieldsWrapped(object);
        object._requiredAuthRole = this.args.requires;
    }

    visitFieldDefinition(
        field: GraphQLField<any, any>,
        details: { objectType: GraphQLObjectType | GraphQLInterfaceType }
    ): GraphQLField<any, any> | void | null {
        this.ensureFieldsWrapped(details.objectType);
        field._requiredAuthRole = this.args.requires;
    }

    ensureFieldsWrapped(objectType: GraphQLObjectType | GraphQLInterfaceType) {
        // Make sure this GraphQLObjectType object never wrapped.
        if (objectType._authFieldsWrapped) return;
        objectType._authFieldsWrapped = true;

        const fields = objectType.getFields();

        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const { resolve = defaultFieldResolver } = field;
            field.resolve = async function (...args) {
                // Get the required role from the field first,
                // falling back to the object's if no role is required by the field.
                const requiredRole: AuthRole = field._requiredAuthRole || objectType._requiredAuthRole;
                if (!requiredRole) {
                    return resolve.apply(this, args);
                }

                const { isAuth, tokenPayload }: { isAuth: boolean, tokenPayload: ITokenPayload } = args[2];
                if (!isAuth) {
                    throw new AuthenticationError('You must be logged in.');
                }

                if (requiredRole != ExtendedRole.Auth) {
                    const user = await User.findById(tokenPayload.userId);
                    if (!user) {
                        throw new AuthenticationError('User does not exist.');
                    }

                    if (user.role != requiredRole) {
                        throw new ForbiddenError('You do not have permission.');
                    }
                }

                return resolve.apply(this, args);
            };
        });
    }
}

// IUser['role'] should not contain 'Auth' role,
// because it is not a real role, a virtual role to check authentication.
enum ExtendedRole {
    Auth = 'Auth'
}

type AuthRole = IUser['role'] | ExtendedRole;

// Declare types for added property.
declare module 'graphql' {
    interface GraphQLObjectType {
        _requiredAuthRole: AuthRole;
        _authFieldsWrapped: boolean;
    }

    interface GraphQLInterfaceType {
        _requiredAuthRole: AuthRole;
        _authFieldsWrapped: boolean;
    }

    interface GraphQLField<TSource, TContext, TArgs = { [key: string]: any }> {
        _requiredAuthRole: AuthRole;
    }
}
