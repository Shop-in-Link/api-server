import express from 'express';
import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import { readJwtSecret } from '../utils/key/jwt';
import { ITokenPayload } from '../utils/TokenPayload';

export const contextHandler = async ({ req }: { req: express.Request }) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return { isAuth: false };
    }

    // Remove 'Bearer'.
    const token = authHeader.split(' ')[1];
    let decodedToken: ITokenPayload;
    try {
        decodedToken = jwt.verify(token, await readJwtSecret(), { algorithms: ['RS256'] }) as ITokenPayload;
    }
    catch {
        throw new AuthenticationError('Invalid token.');
    }

    if (!decodedToken) {
        throw new AuthenticationError('Invalid token.');
    }

    return { isAuth: true, tokenPayload: decodedToken };
}
