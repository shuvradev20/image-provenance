'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
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
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 hover:border-gray-300 hover:shadow-md dark:hover:border-zinc-700 dark:hover:bg-zinc-900 cursor-pointer h-full flex flex-col dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]">
        <div className="relative w-full aspect-square bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
          <img
            src={asset.thumbnailUrl}
            alt={asset.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/10 text-white/90 text-[10px] font-medium px-2.5 py-0.5 tracking-wide uppercase">
              {asset.assetCategory.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="px-4 pb-6 pt-3 flex flex-col grow justify-between gap-3">
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-zinc-100 truncate leading-tight group-hover:text-primary transition-colors">
            {asset.title}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-zinc-800">
            <div 
              onClick={handleProfileClick}
              className="flex items-center gap-2 min-w-0 relative z-10 group/wallet"
            >
              <div 
                className="w-5 h-5 rounded-full shadow-sm shrink-0 border border-gray-200 dark:border-zinc-700"
                style={{ background: generateGradient(asset.currentOwner) }}
              />
              <span className="font-medium text-gray-500 dark:text-zinc-400 text-xs group-hover/wallet:text-gray-900 dark:group-hover/wallet:text-zinc-200 whitespace-nowrap transition-colors">
                {truncateAddress(asset.currentOwner)}
              </span>
            </div>
            
            <div className="flex items-center text-gray-400 dark:text-zinc-500 text-[10px] shrink-0 ml-2">
              <Clock className="w-3 h-3 mr-1 opacity-70" />
              <span className="whitespace-nowrap">
                {formatDistanceToNow(new Date(asset.createdAt))} ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};