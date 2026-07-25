import multer from "multer";
import path from "path";
import type { Request } from "express";


/**
 * RAM Storage: Files stay in memory as Buffer.
 * Ultra-fast for Cloudinary, Pinata, and Python Microservice pipelines.
 */
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
) => {
  const allowedFileTypes = /jpeg|jpg|png|webp|bmp/;
  const hasValidExt = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const hasValidMime = allowedFileTypes.test(file.mimetype);

  if (hasValidExt && hasValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, PNG, WEBP and BMP are allowed."));
  }
};

/**
 * Central Multer Instance (Memory Storage)
 */
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});