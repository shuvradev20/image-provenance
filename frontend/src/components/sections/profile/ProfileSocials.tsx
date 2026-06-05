"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { 
  Mail, 
  Wallet, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Link as LinkIcon,
  Globe
} from "lucide-react";
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
      case 'x': return <FaXTwitter className="w-4 h-4 text-foreground" />;
      case 'facebook': return <FaFacebook className="w-4 h-4 text-blue-600" />;
      case 'instagram': return <FaInstagram className="w-4 h-4 text-pink-500" />;
      default: return <Globe className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className=" overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm relative w-full shadow-lg rounded-xl mt-6">
      <CardHeader className="px-4 sm:px-10 pt-6 sm:pt-8 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" /> Connections & Socials
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-6 sm:px-10 sm:pb-8 space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </h2>
            <p className="text-base text-foreground font-medium">
              {email}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Wallet Address
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-base text-foreground font-medium truncate max-w-50 sm:max-w-xs">
                {walletAddress}
              </p>
              {walletAddress !== "No wallet connected" && (
                <button 
                  type="button" 
                  onClick={handleCopyWallet}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Copy wallet address"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="border-border/50" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Links
            </h2>
            {isEditing && fields.length < MAX_LINKS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ platform: "x", url: "" })}
                className="h-8 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Link
              </Button>
            )}
          </div>

          {fields.length === 0 && !isEditing ? (
            <p className="text-[15px] text-foreground/90">
              No links added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="w-full">
                  
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-start gap-3 bg-muted/20 p-3 rounded-lg border border-border/50">
                      <FormField
                        control={control}
                        name={`socialLinks.${index}.platform`}
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-40">
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="x">X</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`socialLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-1 w-full">
                            <FormControl>
                              <Input placeholder="https://..." className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0 mt-1 sm:mt-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 w-full group">
                      <div className="shrink-0 p-1.5 bg-muted/50 rounded-md group-hover:scale-110 transition-transform">
                        {getPlatformIcon(socialLinks[index]?.platform)}
                      </div>
                      <span className="text-base font-medium capitalize text-foreground shrink-0">
                        {socialLinks[index]?.platform}:
                      </span>
                      <a
                        href={socialLinks[index]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline truncate"
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