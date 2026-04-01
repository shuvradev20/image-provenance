import { PinataSDK } from "pinata";
import fs from "fs";
import { Blob } from "buffer";
import config from "../config/config.js";

const pinata = new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: config.gatewayUrl
})

export const uploadImageToPinata = async (localFilePath: string) => {
    try {
        const fileContent = fs.readFileSync(localFilePath)
        const blob = new Blob([fileContent])

        const file = new (globalThis as any).File([blob], "uploaded_image.png", { type: "image/png" });

        const upload = await pinata.upload.public.file(file)
        fs.unlinkSync(localFilePath)
        return upload.cid;
    } catch (error) {
        console.error("Error uploading image to pinata", error)
        if(fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}

export const uploadMetadataToPinata = async (name: string, description: string, imageCID: string) => {
    try {
        const metaData = {
            name: name,
            description: description,
            image: `ipfs://${imageCID}`,
            timeStamp: new Date().toISOString()
        }

        const upload = await pinata.upload.public.json(metaData)

        return upload.cid
    } catch (error) {
        console.error("Error uploading metadata to Pinata:", error)
        return null
    }
}