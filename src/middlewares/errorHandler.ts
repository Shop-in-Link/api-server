import { Request, Response, NextFunction } from 'express';

/**
 * Error handler for express.
 * This function does NOT handle GraphQL exceptions.
 *
 * @param err Error.
 * @param req Request object from Express.
 * @param res Response object from Express.
 * @param next Next function from express.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).send({ message: err.message });
}
