import { Request, Response } from 'express';

import { Controller, Post, Use } from './decorators';
import { isAuth } from '../middlewares/isAuth';

@Controller('/upload')
class UploadController {
    /**
     * Receive business license images file from the client.
     *
     * @param req Request object from Express.
     * @param res Response object from Express.
     */
    @Post('/businessLicense')
    @Use(isAuth)
    postBusinessLicense(req: Request, res: Response) {
        res.status(201).send({ businessLicense: `/images/licenses/${req.tokenPayload?.userId}` });
    }
}
