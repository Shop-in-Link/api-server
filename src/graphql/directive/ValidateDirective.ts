import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server-express';
import { GraphQLInputField, GraphQLScalarType, GraphQLNonNull } from 'graphql';
import validator from 'validator';

/**
 * Create new ValidatedStringType instance from GraphQLScalarType.
 */
export class ValidateDirective extends SchemaDirectiveVisitor {
    visitInputFieldDefinition(field: GraphQLInputField): GraphQLInputField | void | null {
        if (field.type instanceof GraphQLNonNull &&
            field.type.ofType instanceof GraphQLScalarType)
        {
            field.type = new GraphQLNonNull(new ValidatedStringType(field.type.ofType, this.args));
        }
        else if (field.type instanceof GraphQLScalarType) {
            field.type = new ValidatedStringType(field.type, this.args);
        }
        else {
            throw new Error(`This is not a ScalarType: ${field.type}`);
        }
    }
}

/**
 * ValidatedStringType validates the string to a given condition.
 */
class ValidatedStringType extends GraphQLScalarType {
    constructor(type: GraphQLScalarType, args: Validators) {
        super({
            name: `ValidatedString_${type.name}_${Object.entries(args)
                .map(([key, value]) => `${key}_${value.toString().replace(/\W/g, '')}`)
                .join('_')}`,

            // serialize gets invoked when serializing the result to send it back to a client.
            serialize(value) {
                value = type.serialize(value);

                return value;
            },

            // parseValue gets invoked th parse client input that was passed through variables.
            parseValue(value) {
                validate(value, args);

                return type.parseValue(value);
            },

            // parseLiteral gets invoked to parse client input that was passed inline in the query.
            parseLiteral(ast) {
                return type.parseLiteral(ast, null);
            }
        });

        const validate = (value: string, args: Validators): void => {
            if (args.minLength && !validator.isLength(value, { min: args.minLength })) {
                throw new UserInputError(`Should be at least ${args.minLength} characters.`);
            }

            if (args.maxLength && !validator.isLength(value, { max: args.maxLength })) {
                throw new UserInputError(`Should be no more than ${args.maxLength} characters.`);
            }

            if (args.format) {
                switch (args.format) {
                    case 'EMAIL':
                        if (!validator.isEmail(value)) {
                            throw new UserInputError('Not email format.');
                        }
                        break;

                    case 'FQDN':
                        if (!validator.isFQDN(value)) {
                            throw new UserInputError('Not fully qualified domain name.');
                        }
                        break;
                }
            }
        }
    }
}

interface Validators {
    minLength?: number;
    maxLength?: number;
    format?: string;
}
