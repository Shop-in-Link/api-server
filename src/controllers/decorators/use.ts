import 'reflect-metadata';
import { RequestHandler } from "express";

import { MetaKeys } from "./MetaKeys";

/**
 * Use decorator function factory.
 * The "Use" decorator adds middleware to the controller.
 *
 * @param middleware A middleware to add.
 */
export function Use(middleware: RequestHandler) {
    return function(target: any, key: string, desc: PropertyDescriptor) {
        const middlewares = Reflect.getMetadata(MetaKeys.Middleware, target, key) || [];

        // Decorators are executed from bottom to top (resulting composite (f ∘ g)(x) is equivalent to f(g(x))),
        // new middleware should be added to front of the middlewares array for syntactic sugar.
        middlewares.unshift(middleware);

        Reflect.defineMetadata(MetaKeys.Middleware, [...middlewares], target, key);
    }
}
