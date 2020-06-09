import 'reflect-metadata';
import { RequestHandler } from "express";

import { MetaKeys } from "./MetaKeys";

/**
 * Use decorator function factory.
 * The "Use" decorator adds middleware to the controller.
 *
 * @param middleware
 */
export function Use(middleware: RequestHandler) {
    return function(target: any, key: string, desc: PropertyDescriptor) {
        const middlewares = Reflect.getMetadata(MetaKeys.Middleware, target, key) || [];

        middlewares.push(middleware);

        Reflect.defineMetadata(MetaKeys.Middleware, [...middlewares], target, key);
    }
}
