import 'reflect-metadata';

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
            Reflect.defineMetadata("path", path, target, key);
            Reflect.defineMetadata("method", method, target, key);
        }
    }
}

export const Get = routeBinder("get");
export const Put = routeBinder("put");
export const Post = routeBinder("post");
export const Delete = routeBinder("delete");
export const Patch = routeBinder("patch");
