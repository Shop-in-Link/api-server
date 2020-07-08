import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

import { businessLicensesPath } from './paths';

// Set path where the license files will be stored.
// businessLicensesPath directory must exist.
export const licenseStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, businessLicensesPath);
    },

    filename: (req, file, cb) => {
        cb(null, req.tokenPayload?.userId);
    }
});

export const licenseFileFilter: IMulterFileFilter = (req, file, cb) => {
    const acceptedType = ['image/png', 'image/jpg', 'image/jpeg'];

    if (acceptedType.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('This file can not be uploaded.'));
    }
};

type IMulterFileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => void;
