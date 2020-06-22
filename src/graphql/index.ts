import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import { graphqlTypesPath, graphqlResolversPath } from "../utils/paths";

const types = loadFilesSync(graphqlTypesPath);
const resolvers = loadFilesSync(graphqlResolversPath);

export const mergedTypeDefs = mergeTypeDefs(types);
export const mergedResolvers = mergeResolvers(resolvers);
