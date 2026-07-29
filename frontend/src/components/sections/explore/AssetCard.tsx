'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export interface AssetData {
  _id?: string;
  title: string;
  currentOwner: string;
  assetCategory: string;
  thumbnailUrl: string;
  imageHash: string;
  createdAt: string;
}

interface AssetCardProps {
  asset: AssetData;
}

const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatCompactTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
};

const generateGradient = (address: string) => {
  if (!address) return "linear-gradient(135deg, #3f3f46 0%, #18181b 100%)";
  const colors = [
    ["#3b82f6", "#8b5cf6"],
    ["#10b981", "#3b82f6"],
    ["#f59e0b", "#ef4444"],
    ["#ec4899", "#8b5cf6"],
    ["#06b6d4", "#3b82f6"],
  ];
  const charCode = address.charCodeAt(address.length - 1);
  const colorPair = colors[charCode % colors.length];
  return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
};

export const AssetCard = ({ asset }: AssetCardProps) => {
  const router = useRouter();
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/showcase/${asset.currentOwner}`);
  };

  return (
    <Link href={`/dashboard/asset/${asset.imageHash}`}>
      <div className="group relative overflow-hidden rounded-xl bg-card dark:bg-zinc-900/60 transition-all duration-300 hover:shadow-sm cursor-pointer h-full flex flex-col">
        <div className="relative w-full aspect-square bg-muted/50 border-b border-border overflow-hidden">
          <img
            src={asset.thumbnailUrl}
            alt={asset.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 z-10">
            <Badge title={`Category: ${asset.assetCategory}`} variant="outline" className="bg-black/60 backdrop-blur-md border-white/10 text-white text-[10px] font-medium px-2 py-0.5 tracking-wider uppercase rounded-md shadow-sm">
              {asset.assetCategory.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex flex-col grow justify-between gap-3">
          <h3 title={`Title: ${asset.title}`} className="font-medium text-sm text-foreground truncate leading-tight group-hover:text-foreground/80 transition-colors">
            {asset.title}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <div 
              title={`${asset.currentOwner}`}
              onClick={handleProfileClick}
              className="flex items-center gap-1.5 min-w-0 relative z-10 group/wallet"
            >
              <div 
                className="w-4 h-4 rounded-full shadow-sm shrink-0 border border-border"
                style={{ background: generateGradient(asset.currentOwner) }}
              />
              <span className="font-mono text-[10px] text-muted-foreground group-hover/wallet:text-foreground transition-colors tracking-tight">
                {formatAddress(asset.currentOwner)}
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground text-[10px] shrink-0 ml-2 font-mono tracking-tighter">
              <Clock className="w-3 h-3 mr-1 opacity-60" />
              <span className="whitespace-nowrap">
                {formatCompactTime(asset.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};