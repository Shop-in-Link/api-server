import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import 'dotenv/config';

import { mergedTypeDefs as typeDefs, mergedResolvers as resolvers } from './graphql';
import { ValidateDirective } from './graphql/directive/ValidateDirective';
import { AppRouter } from './AppRouter';

const app = express();
const server = new ApolloServer({ typeDefs, resolvers, schemaDirectives: { validate: ValidateDirective } });

app.use(AppRouter.getInstance());

server.applyMiddleware({ app });

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-mnzxu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then((): void => {
        app.listen(3000, (): void => {
            console.log("Listening on port 3000.");
        });
    })
    .catch((): void => {
        console.log("Failed to start the server!");
    });
