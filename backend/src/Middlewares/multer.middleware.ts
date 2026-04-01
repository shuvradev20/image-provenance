import multer from "multer";
import path from "path";
import type { Request } from "express";

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: any) {
        cb(null, './public/temp');
    },
    filename: function (req: Request, file: Express.Multer.File, cb: any) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() *1E9);
        cb(null, uniqueName + path.extname(file.originalname))
    }
})

export const upload = multer({ storage })