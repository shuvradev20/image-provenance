"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { verifyImageApi } from "@/lib/api/image";

import VerifyDropzone from "./VerifyDropzone";
import VerifyLoading from "./VerifyLoading";
import VerifyResultLeft from "./VerifyResultLeft";
import VerifyResultRight from "./VerifyResultRight";

export type VerifyStatus = "idle" | "loading" | "authentic" | "edited" | "unregistered";

export default function VerifyContainer() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [resultData, setResultData] = useState<any>(null);

  const handleVerification = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("loading");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      // Backend Verification Engine Request 🪄
      const res = await verifyImageApi(formData);

      if (res?.success && res?.data) {
        setResultData(res.data);
        // Validating expected status types
        const backendStatus = res.data.status as VerifyStatus;
        if (["authentic", "edited", "unregistered"].includes(backendStatus)) {
          setStatus(backendStatus);
        } else {
          setStatus("unregistered");
        }
      } else {
        throw new Error(res?.message || "Invalid response from verification engine");
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to verify asset. Please try again."
      );
      setStatus("idle");
      setFile(null);
    }
  };

  const resetVerification = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setResultData(null);
  }, []);

  // --- State 1: IDLE (Top-Weighted Dropzone view) ---
  if (status === "idle") {
    return (
      <main className="min-h-[calc(100vh-4.5rem)] w-full flex flex-col items-center justify-start pt-12 md:pt-16 px-4 pb-12">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Verify Digital Asset
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Upload an image to check its authenticity, ownership, and history on the blockchain.
            </p>
          </div>
          <VerifyDropzone onDrop={handleVerification} />
        </div>
      </main>
    );
  }

  // --- State 2: LOADING ---
  if (status === "loading") {
    return <VerifyLoading file={file} />;
  }

  // --- State 3: RESULT VIEW (Authentic | Edited | Unregistered) ---
  return (
    <div className="w-full min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] lg:overflow-hidden bg-background/50 flex justify-center">
      <div className="flex flex-col lg:flex-row w-full max-w-300 h-auto lg:h-full gap-8 px-4 lg:px-6">
        
        {/* Left Side: Visual Workspace & Banner */}
        <div className="w-full lg:w-[58%] h-auto lg:h-full lg:border-r border-border/40 flex items-center justify-center shrink-0 lg:py-10 lg:pr-8">
          <VerifyResultLeft
            status={status}
            file={file}
            resultData={resultData}
          />
        </div>

        {/* Right Side: Details, Proofs & CTA */}
        <div className="w-full lg:w-[42%] lg:h-full lg:overflow-y-auto flex flex-col gap-6 lg:py-10 pb-12 scroll-smooth custom-scrollbar">
          <VerifyResultRight
            status={status}
            resultData={resultData}
            onReset={resetVerification}
          />
        </div>

      </div>
    </div>
  );
}