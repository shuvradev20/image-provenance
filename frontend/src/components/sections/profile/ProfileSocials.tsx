"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Mail, Wallet, Copy, Check, Plus, Trash2, Link as LinkIcon, Globe, CopyCheck } from "lucide-react";
import { FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";
import { type ProfileFormValues } from "@/lib/validations/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileSocialsProps {
  isEditing: boolean;
  email?: string;
  walletAddress?: string;
}

export function ProfileSocials({ 
  isEditing, 
  email = "No email connected", 
  walletAddress = "No wallet connected" 
}: ProfileSocialsProps) {
  
  const { control, watch } = useFormContext<ProfileFormValues>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    if (walletAddress && walletAddress !== "No wallet connected") {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialLinks = watch("socialLinks") || [];
  const MAX_LINKS = 5;

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'x': return <FaXTwitter className="w-3.5 h-3.5 text-foreground" />;
      case 'facebook': return <FaFacebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'instagram': return <FaInstagram className="w-3.5 h-3.5 text-pink-500" />;
      default: return <Globe className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="overflow-hidden bg-card dark:bg-zinc-900/60 backdrop-blur-sm relative w-full rounded-xl shadow-none mt-6">
      <CardHeader className="px-6 sm:px-8 pt-5 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          <LinkIcon className="w-4 h-4 text-foreground" /> Connections & Socials
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-3 h-3" /> Email Address
            </h2>
            <p className="text-xs text-foreground font-sans">
              {email}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Wallet className="w-3 h-3" /> Wallet Address
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-foreground truncate max-w-50 sm:max-w-xs">
                {walletAddress}
              </p>
              {walletAddress !== "No wallet connected" && (
                <button 
                  type="button" 
                  onClick={handleCopyWallet}
                  className="text-muted-foreground hover:text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors p-1 rounded-md"
                  title="Copy"
                >
                  {copied ? (
                  <CopyCheck className="w-3.5 h-3.5 transition-transform text-foreground " />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground transition-colors" />
                )}
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Links
            </h2>
            {isEditing && fields.length < MAX_LINKS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ platform: "x", url: "" })}
                className="h-7 text-xs px-2.5 rounded-md border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800 cursor-pointer"
                title="Add new social link"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
              </Button>
            )}
          </div>

          {fields.length === 0 && !isEditing ? (
            <p className="text-xs text-muted-foreground">
              No links added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="w-full">
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2.5 bg-zinc-200/30 dark:bg-zinc-900/50 p-2 rounded-lg w-full relative">
               
                      <FormField
                        control={control}
                        name={`socialLinks.${index}.platform`}
                        render={({ field }) => (
                          <FormItem className="w-28 sm:w-36 space-y-0">
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background text-xs h-8 border-border shadow-none">
                                  <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="x" className="text-xs">X</SelectItem>
                                <SelectItem value="instagram" className="text-xs">Instagram</SelectItem>
                                <SelectItem value="facebook" className="text-xs">Facebook</SelectItem>
                                <SelectItem value="website" className="text-xs">Website</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`socialLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-1 w-full space-y-0">
                            <FormControl>
                              <Input 
                                placeholder="https://..." 
                                className="bg-background text-xs h-8 border-border shadow-none font-mono" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="absolute text-[10px] font-mono text-red-500 mt-0.5" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 shrink-0 h-8 w-8 transition-colors cursor-pointer rounded-md"
                        onClick={() => remove(index)}
                        title="Remove social link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <div 
                        className="shrink-0 p-1.5 cursor-pointer bg-zinc-200/50 dark:bg-zinc-800/50 rounded-md"
                        title={socialLinks[index]?.platform?.toUpperCase()}
                      >
                        {getPlatformIcon(socialLinks[index]?.platform)}
                      </div>
                      <a
                        href={socialLinks[index]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-foreground hover:underline cursor-pointer font-mono truncate"
                        title={`Open ${socialLinks[index]?.platform || 'social'} link: ${socialLinks[index]?.url}`}
                      >
                        {socialLinks[index]?.url}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}