import multer from "multer";
import path from "path";
import type { Request } from "express";
import fs from "fs"


const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * @description Configures the RAM (Memory) storage engine for Multer.
 * File is kept in memory as a Buffer. This is lightning fast and perfect 
 * for sending directly to our Python Microservice via API.
 */
const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedFileTypes = /jpeg|jpg|png|webp|gif/;
    const hasValidExt = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const hasValidMime = allowedFileTypes.test(file.mimetype);

    if (hasValidExt && hasValidMime) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG, WEBP, and GIF are allowed."));
    }
}

/**
 * @export uploadMemory
 * @description multer instance for RAM storage. Best for Python Microservice.
 */
export const uploadMemory = multer({ 
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

/**
 * @export uploadLocal
 * @description multer instance for Disk storage. Best for Cloudinary uploads.
 */
export const uploadLocal = multer({
    storage: diskStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    }
});