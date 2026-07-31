"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, IdCard, UserSquare, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { kycSchema, type KycFormValues } from "@/lib/validations/profile";
import { submitKycVerificationApi } from "@/lib/api/user"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface KycVerificationProps {
  onSuccess: () => void;
}

export function KycVerification({ onSuccess }: KycVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      governmentId: "",
      govIdImage: undefined,
      selfieWithGovId: undefined,
    },
  });
  
  const { setUpdatedUser } = useAuthStore();

  const onSubmit = async (data: KycFormValues) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("governmentId", data.governmentId);
      if (data.govIdImage instanceof File) {
        formData.append("govIdImage", data.govIdImage);
      }
      if (data.selfieWithGovId instanceof File) {
        formData.append("selfieWithGovId", data.selfieWithGovId);
      }

      const response = await submitKycVerificationApi(formData);
      setUpdatedUser({ kycStatus: response.data.kycStatus });
      
      toast.success("KYC submitted successfully! Pending admin approval.");
      
      form.reset();
      onSuccess();
      
    } catch (error: any) {
      console.error("KYC Submit Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to submit KYC. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const govIdFile = form.watch("govIdImage");
  const selfieFile = form.watch("selfieWithGovId");

  const govIdPreview = govIdFile instanceof File ? URL.createObjectURL(govIdFile) : null;
  const selfiePreview = selfieFile instanceof File ? URL.createObjectURL(selfieFile) : null;

  return (
    <Card id="kyc-section" className="p-0 overflow-hidden bg-card dark:bg-zinc-900/60 backdrop-blur-sm shadow-none rounded-xl">
      
      <CardHeader className="bg-zinc-200/30 dark:bg-zinc-900/50 rounded-t-xl border border-border px-6 pt-1 pb-4 sm:px-8 sm:pt-6 m-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          <ShieldAlert className="w-4 h-4 text-blue-500" /> Identity Verification (KYC)
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Verify your identity to protect your work on ProveNode.
          Your data is encrypted and handled securely.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="governmentId"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel className="text-xs font-medium">Government ID Number (NID/Passport)</FormLabel>
                  <FormControl>
                    <Input 
                      id="governmentId" 
                      className="bg-zinc-200/30 dark:bg-zinc-900/50 text-xs border-border h-9 font-mono" 
                      placeholder="Enter 10-17 digit ID number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-mono" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="govIdImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Front of Government ID</FormLabel>
                    <FormControl>
                      <label className="flex flex-col items-center justify-center w-full h-36 border border-dashed rounded-lg cursor-pointer bg-zinc-200/30 dark:bg-zinc-900/50 border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors overflow-hidden relative group" title="Upload Front of Government ID">
                        {govIdPreview ? (
                          <>
                            <img src={govIdPreview} alt="ID Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-xs font-medium text-foreground">Click to change image</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <IdCard className="w-6 h-6 text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground text-center px-4">
                              <span className="font-medium text-foreground underline underline-offset-2">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg, image/jpg, image/png, image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange(file);
                          }}
                        />
                      </label>
                    </FormControl>
                    <FormMessage className="text-[10px] font-mono" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selfieWithGovId"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Selfie Holding ID Card</FormLabel>
                    <FormControl>
                      <label className="flex flex-col items-center justify-center w-full h-36 border border-dashed rounded-lg cursor-pointer bg-zinc-200/30 dark:bg-zinc-900/50 border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors overflow-hidden relative group" title="Upload Selfie Holding ID Card">
                        {selfiePreview ? (
                          <>
                            <img src={selfiePreview} alt="Selfie Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-xs font-medium text-foreground">Click to change image</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <UserSquare className="w-6 h-6 text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground text-center px-4">
                              <span className="font-medium text-foreground underline underline-offset-2">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-1">Make sure face & ID are clear</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg, image/jpg, image/png, image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange(file);
                          }}
                        />
                      </label>
                    </FormControl>
                    <FormMessage className="text-[10px] font-mono" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto h-9 text-xs px-4 rounded-md bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
                title="Submit KYC Verification Documents"
              >
                {isSubmitting ? (
                  <>
                    <UploadCloud className="w-3.5 h-3.5 mr-2 animate-bounce" />
                    Uploading Documents...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}