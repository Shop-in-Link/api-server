import express from 'express';

/**
 * Simple singleton class that returns unique router.
 */
export class AppRouter {
    private static instance: express.Router;

    static getInstance(): express.Router {
        if (!AppRouter.instance) {
            AppRouter.instance = express.Router();
        }

        return AppRouter.instance;
    }
}
