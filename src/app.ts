import express from 'express';

import { AppRouter } from "./AppRouter";

const app = express();

app.use(AppRouter.getInstance())

app.listen(3000, (): void => {
    console.log("Listening on port 3000.");
});
