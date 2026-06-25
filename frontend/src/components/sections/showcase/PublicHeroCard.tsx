"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Clock, Copy, Check, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface PublicProfileProps {
  fullName?: string;
  bio?: string;
  location?: string;
  kycStatus?: "unverified" | "pending" | "processing" | "verified";
  walletAddress: string;
  coverImage?: string;   
  profileImage?: string; 
}

export function PublicHeroCard({
  fullName = "Unnamed Creator",
  bio,
  location,
  kycStatus = "unverified",
  walletAddress,
  coverImage,
  profileImage,
}: PublicProfileProps) {
  const [isCopied, setIsCopied] = useState(false);
  const userInitial = fullName.charAt(0).toUpperCase();

  // Wallet Address truncate korar helper
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy to clipboard logic
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
    kycStatus === "verified" ? "text-green-500 border-green-500/30 bg-green-500/10" : 
    kycStatus === "pending" || kycStatus === "processing" ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10" :
    "text-red-500 border-red-500/30 bg-red-500/10";

  return (
    <Card className="p-0 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm relative w-full shadow-lg rounded-xl">
      
      {/* --- Cover Image Section --- */}
      <div className="relative h-48 sm:h-64 w-full bg-muted m-0 p-0 rounded-t-xl overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 block" />
        )}
      </div>

      <CardContent className="relative px-6 pb-8 pt-0 sm:px-10 sm:pb-10 sm:pt-0">
        
        {/* --- Avatar Row --- */}
        <div className="flex justify-between items-start -mt-16 sm:-mt-20 mb-4">
          <div className="relative">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-card">
              <AvatarImage src={profileImage || undefined} alt="Profile" className="object-cover" />
              {/* Tumar dewa exact same AvatarFallback design */}
              <AvatarFallback className="bg-primary/10 text-primary text-4xl sm:text-5xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* --- Text Information Fields --- */}
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

            <div 
              onClick={handleCopyWallet}
              className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-700/50 px-3 py-1.5 rounded-md cursor-pointer transition-colors w-fit group"
              title="Click to copy Wallet Address"
            >
              <div className="w-2 h-2 rounded-full bg-green-500/80 group-hover:bg-green-500 transition-colors" />
              <span className="text-sm font-mono text-zinc-300">
                {truncateAddress(walletAddress)}
              </span>
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 ml-1 transition-colors" />
              )}
            </div>
          </div>
          
          <p className="text-[15px] text-zinc-400 leading-relaxed max-w-3xl mt-1">
             {bio || "No bio added yet."}
          </p>
          
          {location && (
            <div className="flex items-center text-zinc-500 text-sm font-medium mt-1">
              <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
              {location}
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}