"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Camera, ShieldCheck, ShieldAlert, Pencil, Clock, MapPin } from "lucide-react";
import { type ProfileFormValues } from "@/lib/validations/profile";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileBasicInfoProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onKycBadgeClick: () => void;
  kycStatus: "unverified" | "pending" | "processing" | "verified";
}

export function ProfileBasicInfo({ 
  isEditing, 
  setIsEditing, 
  onKycBadgeClick, 
  kycStatus 
}: ProfileBasicInfoProps) {
  
  const { control, watch, setValue } = useFormContext<ProfileFormValues>();

  const coverImageFile = watch("coverImage");
  const profileImageFile = watch("profileImage");
  
  const currentFullName = watch("fullName") || "Unnamed Creator";
  const userInitial = currentFullName.charAt(0).toUpperCase();

  const coverImageUrl = useMemo(() => {
    if (coverImageFile instanceof File) return URL.createObjectURL(coverImageFile);
    return typeof coverImageFile === 'string' ? coverImageFile : null;
  }, [coverImageFile]);
    
  const profileImageUrl = useMemo(() => {
    if (profileImageFile instanceof File) return URL.createObjectURL(profileImageFile);
    return typeof profileImageFile === 'string' ? profileImageFile : null;
  }, [profileImageFile]);

  const renderKycIcon = () => {
    if (kycStatus === "verified") return <ShieldCheck className="w-4 h-4" />;
    if (kycStatus === "pending" || kycStatus === "processing") return <Clock className="w-4 h-4" />;
    return <ShieldAlert className="w-4 h-4" />;
  };

  const badgeColor = 
    kycStatus === "verified" ? "text-green-500 border-green-500/30 bg-green-500/10 hover:bg-green-500/20" : 
    kycStatus === "pending" || kycStatus === "processing" ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20" :
    "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20";

  const kycBadgeButton = (
    <button 
      type="button"
      onClick={onKycBadgeClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs cursor-pointer transition-all border ${badgeColor}`}
      title="Click to manage KYC Verification"
    >
      {renderKycIcon()}
      <span className="capitalize">{kycStatus}</span>
    </button>
  );

  return (
    <Card className="p-0 overflow-hidden border-border bg-card backdrop-blur-sm relative w-full rounded-xl">
      
      <div className="relative h-48 sm:h-64 w-full bg-muted m-0 p-0 rounded-t-xl overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 block transition-colors" />
        )}
        
        {isEditing && (
          <label className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 cursor-pointer z-10">
            <div className="flex items-center gap-2 bg-background hover:bg-muted text-sm p-2 rounded-full backdrop-blur-md transition-colors border">
              <Camera className="w-5 h-5 text-foreground" />
            </div>
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setValue("coverImage", file, { shouldValidate: true });
              }}
            />
          </label>
        )}
      </div>

      <CardContent className="relative px-6 pb-6 pt-0 sm:px-10 sm:pb-6 sm:pt-0">
        
        <div className="flex justify-between items-start -mt-16 sm:-mt-20 mb-6">
          <div className="relative">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-card">
              <AvatarImage src={profileImageUrl || undefined} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl sm:text-5xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <label className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-2 bg-background border rounded-full cursor-pointer hover:bg-muted transition-colors shadow-md">
                <Camera className="w-5 h-5 text-foreground" />
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("profileImage", file, { shouldValidate: true });
                  }}
                />
              </label>
            )}
          </div>

          <div className="flex bg-transparent items-center gap-3 mt-20 sm:mt-24">
            {!isEditing && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="h-auto p-0 text-foreground cursor-pointer hover:bg-transparent shadow-none"
              >
                <Pencil className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline-block">Edit Profile</span>
              </Button>
            )}
          </div>
        </div>

        <div>
          {!isEditing ? (
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {currentFullName}
                </h1>
                {kycBadgeButton}
              </div>
              
              <p className="text-sm text-foreground leading-relaxed max-w-3xl mt-1 mb-4">
                {watch("bio") || "No bio added yet."}
              </p>
              
             <div>
                <h2 className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  Location
                </h2>
                <p className="text-sm text-foreground">
                  {watch("location") || "Not specified"}
                </p>
              </div>
            </div>
          ) : (

            <div className="grid gap-6">
              <div className="flex flex-col gap-1">
                <FormField control={control} name="fullName" render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel className="flex items-center gap-3">
                      Full Name 
                      {kycBadgeButton}
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-muted text-sm" placeholder="Enter your full name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input className="bg-muted text-sm" placeholder="e.g. Dhaka, Bangladesh" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a bit about yourself..." 
                      className="resize-none h-24 bg-muted text-sm" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <p className="text-[10px] text-muted-foreground text-right mt-1">
                    {(field.value?.length || 0)} / 200
                  </p>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}