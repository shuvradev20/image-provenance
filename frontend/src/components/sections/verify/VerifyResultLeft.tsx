"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { VerifyStatus } from "./VerifyContainer";
import ComparisonSlider from "./ComparisonSlider";

interface VerifyResultLeftProps {
  status: VerifyStatus;
  file: File | null;
  resultData: any;
}

export default function VerifyResultLeft({ status, file, resultData }: VerifyResultLeftProps) {
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string>("");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImgUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const getBannerConfig = () => {
    switch (status) {
      case 'authentic':
        return {
          color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
          icon: <CheckCircle2 className="w-4 h-4" />,
          title: "Verified Authentic",
          desc: "This asset is 100% original and protected on ProveNode."
        };
      case 'edited':
        return {
          color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500",
          icon: <AlertTriangle className="w-4 h-4" />,
          title: "Modifications Detected",
          desc: "Watermark DNA matched, but pixel payload has been altered."
        };
      case 'unregistered':
        return {
          color: "bg-destructive/10 border-destructive/20 text-destructive",
          icon: <XCircle className="w-4 h-4" />,
          title: "Unregistered Asset",
          desc: "No ProveNode record found for this image file."
        };
      default:
        return null;
    }
  };

  const banner = getBannerConfig();

  return (
    <div className="w-full h-full flex flex-col items-center justify-between gap-4 sm:py-6 sm:px-12">
      {banner && (
        <div className={`w-full py-3 px-6 rounded-xl border flex items-center gap-3 shrink-0 ${banner.color}`}>
          <div className="shrink-0">{banner.icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-xs sm:text-sm leading-none mb-0.5">{banner.title}</h3>
            <p className="text-[11px] opacity-90 truncate">{banner.desc}</p>
          </div>
        </div>
      )}

      <div className="w-full flex-1 relative flex items-center border border-border justify-center bg-card rounded-xl overflow-hidden">
        {status === 'edited' && resultData?.asset?.thumbnailUrl && uploadedImgUrl ? (
          <ComparisonSlider 
            originalSrc={resultData.asset.thumbnailUrl} 
            uploadedSrc={uploadedImgUrl} 
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {uploadedImgUrl ? (
              <Image
                src={uploadedImgUrl}
                alt="Verified Asset Workspace"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}