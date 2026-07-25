import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import config from '../config/config.js';
import streamifier from 'streamifier'


cloudinary.config({ 
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

export interface CloudinaryUploadOptions {
  folder: string;
  format?: 'webp' | 'png' | 'jpg' | 'jpeg' | 'bmp';
  width?: number;
  height?: number;
  crop?: 'fill' | 'limit' | 'fit' | 'thumb';
  quality?: 'auto' | number;
}

/**
 * @function uploadBufferToCloudinary
 * @description Uploads RAM Buffer directly to Cloudinary without writing to local disk.
 */
export const uploadBufferToCloudinary = async (
  fileBuffer: Buffer, 
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || fileBuffer.length === 0) {
      return reject(new Error("Empty file buffer provided"));
    }

    const { folder, format, width, height, crop, quality = "auto" } = options;

    const uploadOptions: Record<string, any> = {
      folder: `provenode/${folder}`, 
      resource_type: "image",
      quality: quality,
    };

    // Apply transformation rules only when specified
    if (format) uploadOptions.format = format;
    if (width) uploadOptions.width = width;
    if (height) uploadOptions.height = height;
    if (crop) uploadOptions.crop = crop;

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          console.error(`[Cloudinary Error] Failed to upload to folder ${folder}:`, error);
          reject(error);
        }
      }
    );

    // Convert Buffer stream directly into Cloudinary pipeline
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * @function deleteFromCloudinary
 * @description Removes image asset via publicId
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("[Cloudinary Error] Delete failed:", error);
    return null;
  }
};