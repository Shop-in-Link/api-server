import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import User, { IUser } from '../../models/user';
import { Role } from "../../models/enums/Role";
import { readJwtSecret } from '../../utils/key/jwt';
import { ITokenPayload } from '../../utils/TokenPayload';

export default {
    Mutation: {
        /**
         * Create a new user to database.
         *
         * @param parent Parent of resolver chain.
         * @param userInput User inputs sent through GraphQL.
         */
        createUser: async (parent: any, { userInput }: ICreateUserInput) => {
            const { email, password, name, role } = userInput;

            // Admin account is not supposed to be created in this way.
            if (role == Role.Admin) {
                throw new UserInputError('Not allowed.');
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({
                email: email,
                password: hashedPassword,
                name: name,
                role: role
            });

            const createdUser = await user.save();

            return { ...createdUser._doc, _id: createdUser._id.toString() };
        },

        /**
         * Delete the user.
         * UserSchema hooks 'document@remove' to delete all owned links.
         *
         * @param parent Parent of resolver chain.
         * @param args Should be null.
         * @param tokenPayload A JWT payload injected from context handler.
         */
        deleteUser: async (parent: any, args: any, { tokenPayload }: { tokenPayload: ITokenPayload }) => {
            const user = await User.findById(tokenPayload.userId);

            if (!user) {
                throw new UserInputError('User not found.');
            }

            user.remove();

            return true;
        },

        /**
         * Update user name and businessLicense.
         * Use other mutation to change password or role.
         *
         * @param parent Parent of resolver chain.
         * @param args Should be null.
         * @param tokenPayload A JWT payload injected from context handler.
         */
        updateUser: async (parent: any, { userInput }: IUpdateUserInput, { tokenPayload }: { tokenPayload: ITokenPayload }) => {
            const user = await User.findById(tokenPayload.userId);

            if (!user) {
                throw new UserInputError('User not found.');
            }

            user.name = userInput.name || user.name;
            user.businessLicense = userInput.businessLicense || user.businessLicense;

            const updatedUser = await user.save();

            return { ...updatedUser._doc, _id: updatedUser._id.toString() };
        }
    },

    Query: {
        /**
         * Return token after authenticate using given email and password.
         *
         * @param parent Parent of resolver chain.
         * @param email User email.
         * @param password Plain text of password.
         */
        login: async (parent: any, { email, password }: { email: string, password: string }) => {
            const user = await User.findOne({ email: email });
            if (!user) {
                throw new UserInputError('User not found.');
            }

            const isPasswordEqual = await bcrypt.compare(password, user.password);
            if (!isPasswordEqual) {
                throw new UserInputError('Password is incorrect.');
            }

            // Update login time.
            user.loginAt = Date.now().toString();
            user.save();

            // Generate JWT.
            const tokenPayload: ITokenPayload = {
                userId: user._id.toString(),
                email: user.email
            };

            const token = await jwt.sign(
                tokenPayload,
                await readJwtSecret(),
                { algorithm: 'RS256', expiresIn: '1 h' }
            );

            return { token: token, userId: user._id.toString() };
        },

        /**
         * Return current user information.
         *
         * @param parent Parent of resolver chain.
         * @param args Should be null.
         * @param tokenPayload A JWT payload injected from context handler.
         */
        user: async (parent: any, args: any, { tokenPayload }: { tokenPayload: ITokenPayload }) => {
            const user = await User.findById(tokenPayload.userId);

            if (!user) {
                throw new UserInputError('User not found.');
            }

            return { ...user._doc, _id: user._id.toString() };
        }
    }
};

interface ICreateUserInput {
    userInput: {
        email: IUser['email'];
        password: IUser['password'];
        name: IUser['name'];
        role: IUser['role'];
    }
}

interface IUpdateUserInput {
    userInput: {
        name?: IUser['name'];
        businessLicense?: IUser['businessLicense'];
    }
}
