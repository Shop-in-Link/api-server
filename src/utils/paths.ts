import path from 'path';

export const graphqlTypesPath = path.join(__dirname, '..', '..', 'src', 'graphql', '**/*.graphql');
export const graphqlResolversPath = path.join(__dirname, '..', 'graphql', '**/resolver.js');
