import 'reflect-metadata';
import { Request, Response, NextFunction, RequestHandler } from "express";

import { AppRouter } from "../../AppRouter";
import { MetaKeys } from "./MetaKeys";
import { Methods } from "./Methods";

/**
 * Controller decorator function factory.
 *
 * @param routePrefix
 */
export function Controller(routePrefix: string) {
    return function(target: Function) {
        const router = AppRouter.getInstance();

        // Key means functions in target class.
        for (let key in target.prototype) {
            const routeHandler = target.prototype[key];
            const path: string = Reflect.getMetadata(MetaKeys.Path, target.prototype, key);
            const method: Methods = Reflect.getMetadata(MetaKeys.Method, target.prototype, key);
            const middlewares = Reflect.getMetadata(MetaKeys.Middleware, target.prototype, key) || [];
            const bodyHas = Reflect.getMetadata(MetaKeys.BodyHas, target.prototype, key) || [];

            const bodyHasMiddleware = validateBodyHas(bodyHas);

            if (path) {
                router[method](`${routePrefix}${path}`, ...middlewares, bodyHasMiddleware, routeHandler);
            }
        }
    }
}

/**
 * bodyHas middleware function factory.
 *
 * @param keys Parameters to check for existence.
 */
function validateBodyHas(keys: string[]): RequestHandler {
    return function(req: Request, res: Response, next: NextFunction) {
        if (!req.body) {
            res.status(422).end();
            return;
        }

        for (let key of keys) {
            if (!req.body[key]) {
                res.status(422).end();
                return;
            }
        }

        next();
    }
}
