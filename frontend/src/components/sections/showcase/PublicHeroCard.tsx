"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Clock, Copy, CopyCheck, MapPin  } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);


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

export function PublicHeroCard({
  fullName = "Unnamed Creator",
  bio,
  location,
  kycStatus = "unverified",
  walletAddress,
  coverImage,
  profileImage,
  socialLinks = [],
}: PublicProfileProps) {
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
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-card rounded-full bg-card">
              <AvatarImage src={profileImage || undefined} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-card text-foreground text-4xl sm:text-5xl font-semibold transition-colors">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {fullName}
              </h1>
              <div 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${badgeColor}`}
                title={`Status: ${kycStatus}`}
              >
                {renderKycIcon()}
                <span className="capitalize">{kycStatus}</span>
              </div>
            </div>

            <div className="flex items-center max-w-full">
              
              <span className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 break-all sm:break-normal">
                {walletAddress}
              </span>
            
              <button 
                onClick={handleCopyWallet}
                className="p-2 rounded-full hover:bg-muted transition-colors shrink-0 group focus:outline-none"
                title="Copy Wallet Address"
              >
                {isCopied ? (
                  <CopyCheck className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform scale-110" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-500 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
                )}
              </button>
              
            </div>
          </div>
          
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-3xl mt-1">
             {bio || "No bio added yet."}
          </p>
          
          {location && (
            <div className="flex items-center text-muted-foreground text-sm font-medium mt-1">
              <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
              {location}
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
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
                    {platform === 'x' || platform === 'twitter' ? <XIcon /> :
                     platform === 'facebook' ? <FacebookIcon /> :
                     platform === 'instagram' ? <InstagramIcon /> :
                     <GlobeIcon />}
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