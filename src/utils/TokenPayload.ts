import { IUser } from '../models/user';

export interface ITokenPayload {
    userId: IUser['_id'];
    email: IUser['email'];
}
