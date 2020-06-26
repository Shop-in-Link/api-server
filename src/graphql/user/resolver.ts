import bcrypt from 'bcrypt';

import User, { IUser } from '../../models/user';

export default {
    Mutation: {
        /**
         * Create a new user to database.
         *
         * @param parent Parent of resolver chain.
         * @param userInput User inputs sent through GraphQL.
         */
        createUser: async (parent: any, { userInput }: ICreateUserInput) => {
            const { email, password, name, userType } = userInput;

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({
                email: email,
                password: hashedPassword,
                name: name,
                type: userType
            });

            const createdUser = await user.save();

            return { ...createdUser._doc, _id: createdUser._id.toString() };
        }
    }
};

interface ICreateUserInput {
    userInput: {
        email: IUser['email'];
        password: IUser['password'];
        name: IUser['name'];
        userType: IUser['type'];
    }
}
