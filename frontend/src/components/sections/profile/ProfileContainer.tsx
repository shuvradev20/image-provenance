"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 
import { Loader2 } from "lucide-react"; 

import { ProfileBasicInfo } from "./ProfileBasicInfo";
import { ProfileSocials } from "./ProfileSocials";
import { KycVerification } from "./KycVerification";

import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { updateProfileInfoApi, getCurrentUserProfileApi } from "@/lib/api/user";
import { KycCalloutBanner } from "./KycCalloutBanner";

export function ProfileContainer() {
  const [isEditing, setIsEditing] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUpdatedUser } = useAuthStore();

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      bio: "",
      location: "",
      socialLinks: [],
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUserProfileApi();
        const user = response.data; 
        setUserData(user);
        
        let safeSocialLinks = [];
        if (user.socialLinks) {
          const parsed = typeof user.socialLinks === 'string' ? JSON.parse(user.socialLinks) : user.socialLinks;
          safeSocialLinks = Array.isArray(parsed) ? parsed : [];
        }
        
        methods.reset({
          fullName: user.fullName || "",
          bio: user.bio || "",
          location: user.location || "",
          socialLinks: safeSocialLinks,
          profileImage: user.profileImage || undefined,
          coverImage: user.coverImage || undefined,
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [methods]);

  const kycStatus = userData?.kycStatus || "unverified";

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.bio) formData.append("bio", data.bio);
      if (data.location) formData.append("location", data.location);
      if (data.profileImage instanceof File) formData.append("profileImage", data.profileImage);
      if (data.coverImage instanceof File) formData.append("coverImage", data.coverImage);
      
      if (data.socialLinks && data.socialLinks.length > 0) {
        const validLinks = data.socialLinks.filter(link => link.url && link.url.trim() !== "");
        formData.append("socialLinks", JSON.stringify(validLinks));
      } else {
        formData.append("socialLinks", JSON.stringify([]));
      }

      const response = await updateProfileInfoApi(formData);
      const updatedUser = response.data;
      setUpdatedUser(updatedUser);
      setUserData(updatedUser);
      toast.success("Profile updated successfully!");
      setIsEditing(false);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    
    let safeSocialLinks = [];
    if (userData?.socialLinks) {
      const parsed = typeof userData.socialLinks === 'string' ? JSON.parse(userData.socialLinks) : userData.socialLinks;
      safeSocialLinks = Array.isArray(parsed) ? parsed : [];
    }

    methods.reset({
      fullName: userData?.fullName || "",
      bio: userData?.bio || "",
      location: userData?.location || "",
      socialLinks: safeSocialLinks,
      profileImage: userData?.profileImage || undefined,
      coverImage: userData?.coverImage || undefined,
    });
  };

  const handleKycBadgeClick = () => {
    if (kycStatus === "unverified") {
      setIsKycOpen((prev) => {
        const willOpen = !prev;
        
        if (willOpen) {
          setTimeout(() => {
            const kycSection = document.getElementById("kyc-section");
            if (kycSection) {
              kycSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
              
              setTimeout(() => {
                document.getElementById("governmentId")?.focus();
              }, 200);
            }
          }, 150);
        }
        
        return willOpen;
      });
    } else {
      toast.info(`Your KYC is already ${kycStatus}`);
    }
  };

  const handleKycSuccess = () => {
    setUserData((prev: any) => ({ ...prev, kycStatus: "pending" }));
    setIsKycOpen(false); 
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-18 md:pb-8 space-y-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          
          <ProfileBasicInfo 
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onKycBadgeClick={handleKycBadgeClick}
            kycStatus={kycStatus}
          />

          <ProfileSocials 
            isEditing={isEditing} 
            email={userData?.email}
            walletAddress={userData?.walletAddress}
          />

          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end gap-3"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                disabled={isSubmitting}
                className="text-xs h-9 px-4 rounded-md border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
                title="Discard changes"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="text-xs h-9 px-4 rounded-md bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                title="Save changes to profile"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...</>
                ) : "Save Changes"}
              </Button>
            </motion.div>
          )}
        </form>
      </FormProvider>

      {kycStatus === "unverified" && !isEditing && !isKycOpen && (
        <KycCalloutBanner 
          onStartKyc={handleKycBadgeClick} 
          isKycOpen={isKycOpen} 
        />
      )}

      <AnimatePresence>
        {isKycOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full"
          >
            <KycVerification onSuccess={handleKycSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}