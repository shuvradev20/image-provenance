import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import config from '../config/config.js';

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
}

export { uploadOnCloudinary };