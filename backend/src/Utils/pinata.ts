import { PinataSDK } from "pinata";
import config from "../config/config.js";

const pinata = new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: config.gatewayUrl
})

interface FileDetails {
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
}

/**
 * @function uploadImageBufferToPinata
 * @description Uploads raw minted asset image buffer directly to IPFS without local disk I/O.
 */
export const uploadImageBufferToPinata = async (fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<string | null> => {
    try {
        if (!fileBuffer || fileBuffer.length === 0) {
            console.error("[Pinata Upload Error] Empty file buffer provided.");
            return null;
        }

        const file = new File([new Uint8Array(fileBuffer)], originalFilename, { type: mimeType });
        const upload = await pinata.upload.public.file(file);
        
        console.log(`IPFS Image Upload Success: ${upload.cid}`);
        return upload.cid;
    } catch (error) {
        console.error("Error uploading image buffer to pinata:", error);
        return null;
    }
};

export const uploadMetadataToPinata = async (
  title: string,
  description: string,
  imageCID: string,
  assetCategory: string,
  tags: string[],
  fileDetails: FileDetails,
  watermarkID: string,
  imageHash: string
): Promise<string | null> => {
    try {
        const attributes = [
            { trait_type: "Category", value: assetCategory },
            { trait_type: "File Type", value: fileDetails.fileType },
            { display_type: "number", trait_type: "Width (px)", value: fileDetails.width },
            { display_type: "number", trait_type: "Height (px)", value: fileDetails.height },
            { display_type: "number", trait_type: "File Size (Bytes)", value: fileDetails.fileSize }
        ];
    
        if (tags && tags.length > 0) {
            tags.forEach(tag => {
                attributes.push({ trait_type: "Tag", value: tag });
            });
        }
    
        const metaData = {
            name: title,
            description: description,
            image: `ipfs://${imageCID}`,
            external_url: `https://${config.gatewayUrl}/ipfs/${imageCID}`,
            attributes: attributes,
            properties: {
                provenode_watermark_id: watermarkID,
                provenode_image_hash: imageHash,
                created_at: new Date().toISOString()
            }
        };
        const upload = await pinata.upload.public.json(metaData);
        return upload.cid;
    } catch (error) {
        console.error("Error uploading metadata to Pinata:", error);
        return null;
    }
};