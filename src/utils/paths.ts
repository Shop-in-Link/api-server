import path from 'path';
import 'dotenv/config';

export const jwtSecretPath = path.join(__dirname, '..', '..', process.env.JWT_SECRET!);
export const jwtPublicPath = path.join(__dirname, '..', '..', process.env.JWT_PUBLIC!);

export const graphqlTypesPath = path.join(__dirname, '..', '..', 'src', 'graphql', '**/*.graphql');
export const graphqlResolversPath = path.join(__dirname, '..', 'graphql', '**/resolver.js');
