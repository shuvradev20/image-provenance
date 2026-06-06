import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const checkFileTypeAndSize = (file: any) => {
    if (!file || typeof file === "string") return true; 
    
    return file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type);
};

export const profileSchema = z.object({
    fullName: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(20, "Name cannot exceed 20 characters")
        .optional(),
    bio: z.string()
        .max(200, "Bio cannot exceed 200 characters")
        .optional(),
    location: z.string()
        .max(50, "Location cannot exceed 50 characters")
        .optional(),
    profileImage: z.any()
        .refine((file) => checkFileTypeAndSize(file), {
            message: "Max image size is 5MB. Supported formats: jpeg, jpg, png, webp",
        })
        .optional(),
    coverImage: z.any()
        .refine((file) => checkFileTypeAndSize(file), {
            message: "Max image size is 5MB. Supported formats: jpeg, jpg, png, webp",
        })
        .optional(),
    
    socialLinks: z.array(
        z.object({
            platform: z.enum(["x", "instagram", "facebook", "website"], {
                message: "Please select a platform"
            }),
            url: z.string().url("Please enter a valid URL").or(z.literal("")),
        })
    ).max(5, "Maximum 5 links allowed").optional(),
});

export const kycSchema = z.object({
    governmentId: z.string()
        .min(6, "Government ID number must be at least 6 characters")
        .max(20, "Government ID number cannot exceed 20 characters")
        .nonempty("Government ID Number is required"),
        
    govIdImage: z.any()
        .refine((file) => file instanceof File, "Front Government ID image is required")
        .refine((file) => checkFileTypeAndSize(file), "Max image size is 5MB. Supported formats: jpeg, jpg, png, webp"),
    selfieWithGovId: z.any()
        .refine((file) => file instanceof File, "Selfie with ID is required")
        .refine((file) => checkFileTypeAndSize(file), "Max image size is 5MB. Supported formats: jpeg, jpg, png, webp"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type KycFormValues = z.infer<typeof kycSchema>;