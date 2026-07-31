"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Camera, ShieldCheck, ShieldAlert, Pencil, Clock, MapPin } from "lucide-react";
import { type ProfileFormValues } from "@/lib/validations/profile";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

  const badgeStyle = useMemo(() => {
    const statusType = 
      kycStatus === "verified" ? "success" : 
      kycStatus === "pending" || kycStatus === "processing" ? "warning" : "error";
    
    return {
      color: `var(--status-${statusType})`,
      borderColor: `color-mix(in oklch, var(--status-${statusType}) 30%, transparent)`,
      backgroundColor: `color-mix(in oklch, var(--status-${statusType}) 10%, transparent)`,
    };
  }, [kycStatus]);

  const kycBadgeButton = (
    <button 
      type="button"
      onClick={onKycBadgeClick}
      style={badgeStyle}
      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium cursor-pointer transition-all border hover:opacity-90"
      title="Click to manage KYC Verification"
    >
      {renderKycIcon()}
      <span className="capitalize">{kycStatus}</span>
    </button>
  );

  return (
    <Card className="p-0 overflow-hidden bg-card dark:bg-zinc-900/60 backdrop-blur-sm relative w-full rounded-xl shadow-none">
      
      <div className="relative h-44 sm:h-56 w-full bg-zinc-200/30 dark:bg-zinc-900/50 m-0 p-0 rounded-t-xl overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 block transition-colors" />
        )}
        
        {isEditing && (
          <label className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 cursor-pointer z-10" title="Change Cover Photo">
            <div className="flex items-center gap-2 bg-background hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-xs p-2 rounded-full transition-colors border border-border shadow-sm">
              <Camera className="w-4 h-4 text-foreground" />
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

      <CardContent className="relative px-6 pb-6 pt-0 sm:px-8 sm:pb-6 sm:pt-0">
        <div className="flex justify-between items-start -mt-14 sm:-mt-16 mb-5">
          <div className="relative">
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-card dark:border-zinc-900/60">
              <AvatarImage src={profileImageUrl || undefined} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl sm:text-5xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 bg-background border border-border rounded-full cursor-pointer hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors shadow-sm" title="Change Profile Picture">
                <Camera className="w-4 h-4 text-foreground" />
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

          <div className="flex items-center gap-2 mt-16 sm:mt-18">
            {!isEditing && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="text-xs bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-none"
                title="Edit Profile Details"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline-block">Edit Profile</span>
              </Button>
            )}
          </div>
        </div>

        <div>
          {!isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-sm font-medium tracking-tight text-foreground">
                  {currentFullName}
                </h1>
                {kycBadgeButton}
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {watch("bio") || "No bio added yet."}
              </p>
              
             <div className="pt-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mb-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>Location</span>
                </div>
                <p className="text-xs text-foreground">
                  {watch("location") || "Not specified"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <FormField control={control} name="fullName" render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    Full Name 
                    {kycBadgeButton}
                  </FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-200/30 dark:bg-zinc-900/50 text-xs border-border h-9" placeholder="Enter full name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />
           
              <FormField control={control} name="location" render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel className="text-xs font-medium">Location</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-200/30 dark:bg-zinc-900/50 text-xs border-border h-9" placeholder="e.g. Dhaka, Bangladesh" {...field} value={field.value || ""}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a bit about yourself..." 
                      className="resize-none h-20 bg-zinc-200/30 dark:bg-zinc-900/50 text-xs border-border" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <p className="text-[10px] font-mono text-muted-foreground text-right mt-1">
                    {(field.value?.length || 0)} / 200
                  </p>
                  <FormMessage className="text-[10px]"/>
                </FormItem>
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}