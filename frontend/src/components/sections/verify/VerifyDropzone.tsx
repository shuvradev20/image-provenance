"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface VerifyDropzoneProps {
  onDrop: (file: File) => void;
}

export default function VerifyDropzone({ onDrop }: VerifyDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      }}
      className={`
        cursor-pointer w-full max-w-xl mx-auto h-76 rounded-2xl 
        border-2 border-dashed flex flex-col items-center justify-center 
        p-6 text-center transition-all duration-200 select-none
        ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/60 hover:bg-muted/30"
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) processFile(e.target.files[0]);
        }}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      <div className="mb-4 p-6 rounded-full bg-muted">
        {isDragging ? (
          <UploadCloud className="w-9 h-9 text-primary animate-bounce" />
        ) : (
          <ImageIcon className="w-9 h-9 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-base text-foreground">
          {isDragging ? (
            "Drop image here to verify"
          ) : (
            <>
              Drag and drop an image here, or{" "}
              <span className="text-primary">browse</span>
            </>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports JPG, PNG, WEBP • Max 15MB
        </p>
      </div>
    </div>
  );
}