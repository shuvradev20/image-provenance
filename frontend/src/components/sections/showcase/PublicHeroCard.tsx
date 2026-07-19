"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Clock, Copy, CopyCheck, MapPin, Wallet  } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XIcon, FacebookIcon, InstagramIcon, GlobeIcon } from "@/components/icons/publicHeroCardLogo";

export interface PublicProfileProps {
  fullName?: string;
  bio?: string;
  location?: string;
  kycStatus?: "unverified" | "pending" | "processing" | "verified";
  walletAddress: string;
  coverImage?: string;
  profileImage?: string;
  socialLinks?: { platform: string; url: string }[];
}

export function PublicHeroCard({fullName = "Unnamed Creator", bio, location, kycStatus = "unverified", walletAddress, coverImage, profileImage, socialLinks = [] }: PublicProfileProps) {
  const [isCopied, setIsCopied] = useState(false);
  const userInitial = fullName.charAt(0).toUpperCase();

  const handleCopyWallet = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const renderKycIcon = () => {
    if (kycStatus === "verified") return <ShieldCheck className="w-4 h-4" />;
    if (kycStatus === "pending" || kycStatus === "processing") return <Clock className="w-4 h-4" />;
    return <ShieldAlert className="w-4 h-4" />;
  };

  const badgeColor =
    kycStatus === "verified" ? "text-green-600 border-green-200 bg-green-50 dark:text-green-500 dark:border-green-500/30 dark:bg-green-500/10" :
    kycStatus === "pending" || kycStatus === "processing" ? "text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-500 dark:border-yellow-500/30 dark:bg-yellow-500/10" :
    "text-red-600 border-red-200 bg-red-50 dark:text-red-500 dark:border-red-500/30 dark:bg-red-500/10";

  return (
    <Card className="p-0 overflow-hidden border-border/50 bg-card backdrop-blur-sm relative w-full rounded-xl">
      
      <div className="relative h-48 sm:h-64 w-full bg-muted m-0 p-0 rounded-t-xl overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 block transition-colors" />
        )}
      </div>

      <CardContent className="relative px-6 pb-8 pt-0 sm:px-10 sm:pb-10 sm:pt-0">
        <div className="flex justify-between items-start -mt-16 sm:-mt-20 mb-4">
          <div className="relative">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-card">
              <AvatarImage src={profileImage || undefined} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl sm:text-5xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-4 sm:gap-0 sm:block">

            <div className="order-1 flex flex-wrap items-center gap-3 sm:inline-flex sm:mr-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {fullName}
              </h1>
              <div 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-border ${badgeColor}`}
                title={`Status: ${kycStatus}`}
              >
                {renderKycIcon()}
                <span className="capitalize">{kycStatus}</span>
              </div>
            </div>

            <p className="order-2 text-sm text-foreground leading-relaxed max-w-3xl mt-1 sm:mt-2">
              {bio || "No bio added yet."}
            </p>

            <div className="order-3 flex flex-col sm:block sm:float-right sm:-mt-10 sm:mb-4 w-full sm:w-auto">
              <div className="flex items-center text-muted-foreground">
                <Wallet className="w-4 h-4 mr-1.5" />
                <span className="text-sm">Wallet Address</span>
              </div>

              <div className="flex items-center max-w-full">
                <span className="text-sm font-mono text-foreground break-all sm:break-normal">
                  <span className="inline sm:hidden">
                    {walletAddress ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}` : ""}
                  </span>
                  <span className="hidden sm:inline">
                    {walletAddress}
                  </span>
                </span>
              
                <button 
                  onClick={handleCopyWallet}
                  className="p-2 rounded-full hover:bg-muted transition-colors shrink-0 group focus:outline-none"
                  title="Copy Wallet Address"
                >
                  {isCopied ? (
                    <CopyCheck className="w-4 h-4 text-forground transition-transform" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-forground transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden sm:block clear-both" />
          
          {location && (
            <div className="order-4 flex flex-col gap-1 text-sm mt-1 sm:-mt-8">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span className="text-sm">Location</span>
              </div>
              <div className="pl-0 text-foreground">
                {location}
              </div>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="order-5 flex items-center gap-3 mt-2 sm:mt-2 -ml-2">
              {socialLinks.map((link, index) => {
                const platform = link.platform?.toLowerCase();
                return (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors focus:outline-none"
                    title={link.platform}
                  >
                    {platform === 'x' || platform === 'twitter' ? <XIcon className="w-4 h-4" /> :
                     platform === 'facebook' ? <FacebookIcon className="w-4 h-4"/> :
                     platform === 'instagram' ? <InstagramIcon className="w-4 h-4"/> :
                     <GlobeIcon className="w-5 h-5"/>}
                  </a>
                );
              })}
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}