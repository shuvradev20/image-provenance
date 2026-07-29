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
    if (kycStatus === "verified") return <ShieldCheck className="w-3.5 h-3.5 shrink-0" />;
    if (kycStatus === "pending" || kycStatus === "processing") return <Clock className="w-3.5 h-3.5 shrink-0" />;
    return <ShieldAlert className="w-3.5 h-3.5 shrink-0" />;
  };

  const badgeStyle =
    kycStatus === "verified"
      ? "text-[oklch(0.627_0.194_149.214)] border-[oklch(0.627_0.194_149.214)]/30 bg-[oklch(0.627_0.194_149.214)]/10"
      : kycStatus === "pending" || kycStatus === "processing"
      ? "text-[oklch(0.769_0.188_70.08)] border-[oklch(0.769_0.188_70.08)]/30 bg-[oklch(0.769_0.188_70.08)]/10"
      : "text-[oklch(0.577_0.245_27.325)] border-[oklch(0.577_0.245_27.325)]/30 bg-[oklch(0.577_0.245_27.325)]/10";

  return (
    <Card className="p-0 overflow-hidden bg-card dark:bg-zinc-900/60 relative w-full rounded-xl shadow-none">
      
      <div className="relative h-44 sm:h-60 w-full bg-muted m-0 p-0 rounded-t-xl overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 block transition-colors" />
        )}
      </div>

      <CardContent className="relative px-6 pb-8 pt-0 sm:px-8 sm:pb-8 sm:pt-0">
        <div className="flex justify-between items-start -mt-14 sm:-mt-16 mb-4">
          <div className="relative">
            <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-card dark:border-zinc-900/60">
              <AvatarImage src={profileImage || undefined} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl sm:text-5xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-4 sm:gap-0 sm:block">

            <div className="order-1 flex flex-wrap items-center gap-2.5 sm:inline-flex sm:mr-3">
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-foreground">
                {fullName}
              </h1>
              <div 
                className={`flex items-center cursor-pointer gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${badgeStyle}`}
                title={`KYC Status: ${kycStatus}`}
              >
                {renderKycIcon()}
                <span className="capitalize">{kycStatus}</span>
              </div>
            </div>

            <p className="order-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl mt-1 sm:mt-2 font-sans">
              {bio || "No bio added yet."}
            </p>

            <div className="order-3 flex flex-col sm:block sm:float-right sm:-mt-8 sm:mb-4 w-full sm:w-auto">
              <div className="flex items-center text-muted-foreground mb-0.5">
                <Wallet className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Wallet Address</span>
              </div>

              <div className="flex items-center max-w-full gap-1">
                <span className="text-xs font-mono text-foreground break-all sm:break-normal">
                  <span className="inline sm:hidden">
                    {walletAddress ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}` : ""}
                  </span>
                  <span className="hidden sm:inline">
                    {walletAddress}
                  </span>
                </span>
              
                <button 
                  title={isCopied ? "Copied!" : `Copy`}
                  onClick={handleCopyWallet}
                  className="p-1.5 rounded-md transition-colors shrink-0 group focus:outline-none cursor-pointer"
                >
                  {isCopied ? (
                    <CopyCheck className="w-3.5 h-3.5 text-foreground transition-transform" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden sm:block clear-both" />
          
          {location && (
            <div className="order-4 flex flex-col gap-0.5 text-xs sm:-mt-6">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Location</span>
              </div>
              <div className="text-foreground text-xs font-sans">
                {location}
              </div>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="order-5 flex items-center gap-1.5 mt-1 -ml-1">
              {socialLinks.map((link, index) => {
                const platform = link.platform?.toLowerCase();
                return (
                  <a 
                    title={link.platform}
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 rounded-md hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  >
                    {platform === 'x' || platform === 'twitter' ? <XIcon className="w-3.5 h-3.5" /> :
                     platform === 'facebook' ? <FacebookIcon className="w-3.5 h-3.5"/> :
                     platform === 'instagram' ? <InstagramIcon className="w-3.5 h-3.5"/> :
                     <GlobeIcon className="w-4 h-4"/>}
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