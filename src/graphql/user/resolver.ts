import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import User, { IUser } from '../../models/user';
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

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({
                email: email,
                password: hashedPassword,
                name: name,
                role: role
            });

            const createdUser = await user.save();

            return { ...createdUser._doc, _id: createdUser._id.toString() };
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
