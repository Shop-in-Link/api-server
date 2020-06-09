import express from 'express';

const app = express();

app.listen(3000, (): void => {
    console.log("Listening on port 3000.");
});
