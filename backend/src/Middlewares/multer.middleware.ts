import multer from "multer";
import path from "path";
import type { Request } from "express";

/**
 * @description Configures the local storage engine for Multer.
 * Files are temporarily saved in the './public/temp' directory before being 
 * uploaded to Cloudinary or IPFS (Pinata) or processed for hashing.
 */
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: any) {
        cb(null, './public/temp');
    },
    filename: function (req: Request, file: Express.Multer.File, cb: any) {

        // Generating a unique filename to prevent overwriting files with the same name
        const uniqueName = Date.now() + '-' + Math.round(Math.random() *1E9);
        cb(null, uniqueName + path.extname(file.originalname))
    }
})

/**
 * @function fileFilter
 * @description Security middleware to ensure only valid image formats are uploaded.
 * Rejects non-image files to protect the server and maintain DApp integrity.
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Defined allowed extensions and MIME types
    const allowedFileTypes = /jpeg|jpg|png|webp|gif/;

    // Check both extension and MIME type for double security
    const hasValidExt = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const hasValidMime = allowedFileTypes.test(file.mimetype);

    if (hasValidExt && hasValidMime) {
        cb(null, true);
    } else {
        // Using standard Error as Multer's callback expects it. 
        // This will be caught by the global error handler.
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG, WEBP, and GIF are allowed."));
    }

}

export const upload = multer({ storage })