"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { verifyImageApi } from "@/lib/api/image";
import VerifyDropzone from "./VerifyDropzone";
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
      const res = await verifyImageApi(formData);

      if (res?.success && res?.data) {
        setResultData(res.data);
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

  if (status === "idle" || status === "loading") {
    return (
      <main className="w-full h-full flex flex-col items-center justify-start pt-12 sm:pt-16 p-4">
        <div className="max-w-2xl w-full space-y-5">
        <div className="space-y-1.5 text-left w-full">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Verify Digital Asset
          </h1>
          <p className="text-muted-foreground text-sm w-full">
            Upload an image to check its authenticity, ownership, and history on the blockchain.
          </p>
        </div>

        <VerifyDropzone 
          onDrop={handleVerification} 
          isLoading={status === "loading"}
          selectedFile={file}
        />
        </div>
      </main>
    );
  }

  return (
    <div className="w-full flex items-center justify-center pb-4 lg:pb-0">
      <div className="w-full max-w-7xl h-auto lg:h-[calc(100vh-112px)] flex flex-col lg:flex-row rounded-xl bg-card dark:bg-zinc-900/60 md:overflow-hidden">
        <div className="w-full lg:w-[65%] h-87.5 lg:h-full relative p-4 lg:p-8 flex items-center justify-center shrink-0 overflow-hidden">
          <VerifyResultLeft
            status={status}
            file={file}
            resultData={resultData}
          />
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 my-6 w-px bg-border" />
        </div>

        <div className="w-full lg:w-[35%] h-auto lg:h-full lg:overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar shrink">
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