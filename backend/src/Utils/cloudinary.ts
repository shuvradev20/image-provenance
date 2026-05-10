import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import config from '../config/config.js';
import streamfier from 'streamifier'


cloudinary.config({ 
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" 
        });

        fs.unlinkSync(localFilePath);
        return response; 

    } catch (error) {
        console.error("Cloudinary Upload Error: ", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

/**
 * @function uploadBufferOnCloudinary
 * @description Directly uploads a memory buffer to Cloudinary without saving to disk.
 * Optimizes the image to a lightweight WebP format for dashboard speed.
 */
const uploadBufferOnCloudinary = async (fileBuffer: Buffer) => {
    return new Promise((resolve, reject) => {
        if(!fileBuffer) {
            return reject("No buffer provided");
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "provenode_thumbnails",
                format: "webp",
                quality: "auto",
                width: 800,
                crop: "limit"
            },
            (error, result) => {
                if(result) {
                    resolve(result);
                } else {
                    console.error("Cloudinary Buffer Upload Error: ", error);
                    reject(error);
                }
            }
        );

        // Convert the Buffer into a readable stream and pipe it to Cloudinary
        streamfier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

/**
 * @function deleteFromCloudinary
 * @description Deletes an image from Cloudinary using its public ID.
 */
const deleteFromCloudinary = async (publicId: string) => {
    try {
        if (!publicId) return null;
        
        // Cloudinary theke delete korar asol command
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(`Cloudinary image deleted: ${publicId}`);
        return response;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, uploadBufferOnCloudinary, deleteFromCloudinary };