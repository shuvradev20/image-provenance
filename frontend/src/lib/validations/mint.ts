import * as z from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const checkFileTypeAndSize = (file: any) => {
    if (!file || typeof file === "string") return true; 
    
    return file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type);
};

export const mintAssetSchema = z.object({
    title: z.string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title cannot exceed 100 characters")
        .nonempty("Asset title is required"),
        
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description cannot exceed 1000 characters")
        .nonempty("Asset description is required"),
        
    assetCategory: z.enum(
        ['photography', 'digital_art', 'ai_generated', 'news_media', 'illustration', 'other'],
        { 
            message: "Please select a valid asset category"
        }
    ),
    
    // Backend e tumi tags ke comma-separated string hisabe necho (tags.split(',')).
    // Tai frontend eo amra eta string hisabei nilam. User comma diye diye tags likhbe.
    tags: z.string()
        .max(100, "Tags string cannot exceed 100 characters")
        .optional(),
        
    assetImage: z.any()
        .refine((file) => file instanceof File, "Asset image file is required")
        .refine((file) => checkFileTypeAndSize(file), {
            message: "Max image size is 5MB. Supported formats: jpeg, jpg, png, webp",
        }),
});

export type MintAssetFormValues = z.infer<typeof mintAssetSchema>;