"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface VerifyDropzoneProps {
  onDrop: (file: File) => void;
  isLoading?: boolean;
  selectedFile?: File | null;
}

export default function VerifyDropzone({ 
  onDrop, 
  isLoading = false, 
  selectedFile = null 
}: VerifyDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }, [selectedFile]);

  const processFile = (file: File) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File limit exceeded. Maximum allowed size is 15MB.");
      return;
    }

    onDrop(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <style jsx global>{`
        @keyframes scanHorizontal {
          0% {
            left: -30%;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            left: 110%;
            opacity: 0;
          }
        }
      `}</style>

      <div
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isLoading && e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        title={isLoading ? "Analyzing asset..." : "Click or drag and drop an image to verify asset authenticity"}
        className={`
          relative w-full h-72 rounded-xl border flex flex-col items-center justify-center 
          p-6 text-center transition-all duration-200 select-none overflow-hidden
          ${isLoading ? "cursor-wait border-primary/50 bg-card" : "cursor-pointer"}
          ${
            !isLoading && isDragging
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : !isLoading
              ? "border-dashed border-border bg-card hover:border-primary/50 dark:hover:border-primary/40"
              : ""
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          disabled={isLoading}
          onChange={(e) => {
            if (e.target.files?.[0]) processFile(e.target.files[0]);
          }}
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
        />

        {isLoading ? (
          <>
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Scanning Asset"
                fill
                className="object-contain p-4 transition-opacity opacity-90"
                priority
              />
            )}
            <div className="absolute inset-0 pointer-events-none z-0" />
            <div
              className="absolute top-0 bottom-0 w-32 bg-linear-to-r from-transparent via-white/30 dark:via-white/15 to-transparent pointer-events-none z-10 backdrop-blur-[1px]"
              style={{ animation: "scanHorizontal 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
            />
          </>
        ) : (
          <>
            <div className="mb-5 p-5 rounded-full bg-zinc-100 dark:bg-zinc-800/60">
              {isDragging ? (
                <UploadCloud className="w-8 h-8 text-primary animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? (
                  "Drop image here to verify"
                ) : (
                  <>
                    Drag and drop an image here, or{" "}
                    <span className="text-foreground underline decoration-1 underline-offset-2">browse</span>
                  </>
                )}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground tracking-wide">
                Supports JPG, PNG, WEBP • Max 15MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}