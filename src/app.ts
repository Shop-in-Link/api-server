import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import 'dotenv/config';

import { mergedTypeDefs as typeDefs, mergedResolvers as resolvers } from './graphql';
import { ValidateDirective, AuthDirective } from './graphql/directive';
import { contextHandler } from './middlewares/contextHandler';
import { errorHandler } from './middlewares/errorHandler';
import { AppRouter } from './AppRouter';
import './controllers/UploadController';

const app = express();
const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: { validate: ValidateDirective, auth: AuthDirective },
    context: contextHandler
});

app.use(AppRouter.getInstance());
app.use(errorHandler);

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
