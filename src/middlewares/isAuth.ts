import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { ITokenPayload } from '../utils/TokenPayload';
import { readJwtSecret } from '../utils/key/jwt';
import { ErrorBuilder } from '../utils/ErrorBuilder';

/**
 * Insert decoded token data into req object.
 *
 * @param req Request object from Express.
 * @param res Response object from Express.
 * @param next Next function.
 */
export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        next(new ErrorBuilder('Not authenticated.').status(401).build());
        return;
    }

    // Remove 'Bearer'.
    const token = authHeader.split(' ')[1];
    let decodedToken: ITokenPayload;
    try {
        decodedToken = jwt.verify(token, await readJwtSecret(), { algorithms: ['RS256'] }) as ITokenPayload;
    }
    catch {
        next(new ErrorBuilder('Invalid token.').status(401).build());
        return;
    }

    if (!decodedToken) {
        next(new ErrorBuilder('Invalid token.').status(401).build());
        return;
    }

    req.tokenPayload = decodedToken;

    next();
}

// Declare types.
declare module 'express' {
    interface Request {
        tokenPayload?: ITokenPayload;
    }
}
