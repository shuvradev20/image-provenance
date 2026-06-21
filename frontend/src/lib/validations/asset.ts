import * as z from "zod";

export const editMetadataSchema = z.object({
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
    
    tags: z.string()
        .max(100, "Tags string cannot exceed 100 characters")
        .optional(),
});

export type EditMetadataFormValues = z.infer<typeof editMetadataSchema>;

export const transferAssetSchema = z.object({
    newOwnerWallet: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum wallet address")
        .nonempty("Recipient wallet address is required"),
});

export type TransferAssetFormValues = z.infer<typeof transferAssetSchema>;