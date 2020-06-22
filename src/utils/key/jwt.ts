import fs from 'fs/promises';

import { jwtSecretPath, jwtPublicPath } from '../paths';

/**
 * Read JSON Web Token private key from the file.
 *
 * @return JSON Web Token private key.
 */
export function readJwtSecret(): Promise<Buffer> {
    return fs.readFile(jwtSecretPath);
}

/**
 * Read JSON Web Token public key from the file.
 *
 * @return JSON Web Token public key.
 */
export function readJwtPublic(): Promise<Buffer> {
    return fs.readFile(jwtPublicPath);
}
