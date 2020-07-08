import { Request, Response } from 'express';
import multer from 'multer';

import { Controller, Post, Use } from './decorators';
import { isAuth } from '../middlewares/isAuth';
import { licenseStorage, licenseFileFilter } from '../utils/multerOptions';

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
    @Use(multer({
        storage: licenseStorage,
        fileFilter: licenseFileFilter,
        limits: { fileSize: maxFileSize }
    }).single('license'))
    postBusinessLicense(req: Request, res: Response) {
        res.status(201).send({ businessLicense: `/images/licenses/${req.tokenPayload?.userId}` });
    }
}

const maxFileSize = 1024 * 1024 * 10;  // File limit is 10 MB.
