import * as z from "zod";

const MAX_PROFILE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_KYC_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const checkFileTypeAndSize = (file: any, maxSize: number = MAX_PROFILE_FILE_SIZE) => {
    if (!file || typeof file === "string") return true; 
    
    if (typeof window !== "undefined" && file instanceof File) {
        return file.size <= maxSize && ACCEPTED_IMAGE_TYPES.includes(file.type);
    }
    return true;
};

export const profileSchema = z.object({
    fullName: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(20, "Name cannot exceed 20 characters")
        .optional()
        .or(z.literal("")),
    bio: z.string()
        .max(200, "Bio cannot exceed 200 characters")
        .optional()
        .or(z.literal("")),
    location: z.string()
        .max(50, "Location cannot exceed 50 characters")
        .optional()
        .or(z.literal("")),
    profileImage: z.any()
        .refine((file) => checkFileTypeAndSize(file, MAX_PROFILE_FILE_SIZE), {
            message: "Max image size is 5MB. Formats: jpeg, jpg, png, webp",
        })
        .optional(),
    coverImage: z.any()
        .refine((file) => checkFileTypeAndSize(file, MAX_PROFILE_FILE_SIZE), {
            message: "Max image size is 5MB. Formats: jpeg, jpg, png, webp",
        })
        .optional(),
    socialLinks: z.array(
        z.object({
            platform: z.enum(["x", "instagram", "facebook", "website"], {
                message: "Please select a valid platform",
            }),
            url: z.string().url("Please enter a valid URL").or(z.literal("")),
        })
    ).max(5, "Maximum 5 links allowed").optional(),
});

export const kycSchema = z.object({
    governmentId: z.string()
        .trim()
        .min(6, "Government ID number must be at least 6 characters")
        .max(20, "Government ID number cannot exceed 20 characters"),
        
    govIdImage: z.any()
        .refine((file) => typeof window !== "undefined" && file instanceof File, "Front Government ID image is required")
        .refine((file) => checkFileTypeAndSize(file, MAX_KYC_FILE_SIZE), "Max image size is 10MB. Formats: jpeg, jpg, png, webp"),
    selfieWithGovId: z.any()
        .refine((file) => typeof window !== "undefined" && file instanceof File, "Selfie with ID is required")
        .refine((file) => checkFileTypeAndSize(file, MAX_KYC_FILE_SIZE), "Max image size is 10MB. Formats: jpeg, jpg, png, webp"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type KycFormValues = z.infer<typeof kycSchema>;