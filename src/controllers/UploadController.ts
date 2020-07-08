import { Request, Response } from 'express';

import { Controller, Post } from './decorators';

@Controller('/upload')
class UploadController {
    /**
     * Receive business license images file from the client.
     *
     * @param req Request object from Express.
     * @param res Response object from Express.
     */
    @Post('/businessLicense')
    postBusinessLicense(req: Request, res: Response) {
        res.status(201).send({ businessLicense: `/images/licenses/${req.tokenPayload?.userId}` });
    }
}
