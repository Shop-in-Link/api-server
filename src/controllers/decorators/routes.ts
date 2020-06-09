import 'reflect-metadata';
import { MetaKeys } from "./MetaKeys";
import { Methods } from './Methods';

/**
 * Route function factory.
 * Returns a function based on the given method.
 *
 * @param method REST methods(Get, Put, Post, Delete, Patch).
 */
function routeBinder(method: string) {
    return function(path: string) {
        return function(target: any, key: string, desc: PropertyDescriptor) {
            // Attach the metadata to the object(function in the class) using TypeScript's decorator.
            Reflect.defineMetadata(MetaKeys.Path, path, target, key);
            Reflect.defineMetadata(MetaKeys.Method, method, target, key);
        }
    }
}

export const Get = routeBinder(Methods.Get);
export const Put = routeBinder(Methods.Put);
export const Post = routeBinder(Methods.Post);
export const Delete = routeBinder(Methods.Delete);
export const Patch = routeBinder(Methods.Patch);
