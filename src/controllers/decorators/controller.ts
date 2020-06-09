import 'reflect-metadata';

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

            if (path) {
                router[method](`${routePrefix}${path}`, routeHandler);
            }
        }
    }
}
