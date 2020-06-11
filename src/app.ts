import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

import { AppRouter } from "./AppRouter";

const app = express();

app.use(AppRouter.getInstance());

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
