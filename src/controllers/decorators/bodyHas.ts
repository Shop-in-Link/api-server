import 'reflect-metadata';

import { MetaKeys } from "./MetaKeys";

/**
 * BodyHas decorator function factory.
 * The BodyHas decorator ensures that certain members of the body are present.
 *
 * @param keys Parameters to check for existence.
 */
export function BodyHas(...keys: string[]) {
    return function(target: any, key: string, desc: PropertyDescriptor) {
        Reflect.defineMetadata(MetaKeys.BodyHas, keys, target, key);
    }
}
