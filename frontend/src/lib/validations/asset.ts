import * as z from "zod";

const MAX_MINT_FILE_SIZE = 15 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const checkFileTypeAndSize = (file: any) => {
  if (!file || typeof file === "string") return true; 

  if (typeof window !== "undefined" && file instanceof File) {
    return file.size <= MAX_MINT_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type);
  }
  
  return true;
};

export const baseMetadataSchema = z.object({
  title: z.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
      
  description: z.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
      
  assetCategory: z.enum(
    ['photography', 'digital_art', 'ai_generated', 'news_media', 'illustration', 'other'],
    { message: "Please select a valid asset category" }
  ),
  
  tags: z.string()
    .trim()
    .max(100, "Tags string cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
});

export const editMetadataSchema = baseMetadataSchema;

export const mintAssetSchema = baseMetadataSchema.extend({
  assetImage: z.any()
    .refine((file) => typeof window !== "undefined" && file instanceof File, "Asset image file is required")
    .refine((file) => checkFileTypeAndSize(file), {
      message: "Max image size is 15MB. Supported formats: JPEG, JPG, PNG, WEBP",
    }),
});

export const transferAssetSchema = z.object({
  newOwnerWallet: z.string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum wallet address (e.g. 0x123...)"),
});

export type EditMetadataFormValues = z.infer<typeof editMetadataSchema>;
export type MintAssetFormValues = z.infer<typeof mintAssetSchema>;
export type TransferAssetFormValues = z.infer<typeof transferAssetSchema>;