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
    <Card id="kyc-section" className="p-0 overflow-hidden border-red-500/20 bg-card/50 backdrop-blur-sm mt-6 shadow-lg shadow-red-500/5">
      
      <CardHeader className="bg-red-500/10 rounded-t-xl border-b border-border/50 px-6 pt-6 sm:px-10 sm:pt-8 pb-5 m-0">
        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
          <ShieldAlert className="w-5 h-5 text-red-500" /> Identity Verification (KYC)
        </CardTitle>
        <CardDescription className="mt-1">
          Verify your identity to protect your work on ProveNode.
          Your data is encrypted and handled securely.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 pt-6 sm:px-10 sm:pb-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Government ID Text Input */}
            <FormField
              control={form.control}
              name="governmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Government ID Number (NID/Passport)</FormLabel>
                  <FormControl>
                    <Input id="governmentId" placeholder="Enter your 10-17 digit ID number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Government ID Image Upload with Preview */}
              <FormField
                control={form.control}
                name="govIdImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Front of Government ID</FormLabel>
                    <FormControl>
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 border-muted-foreground/30 hover:bg-muted/50 hover:border-primary/50 transition-all overflow-hidden relative group">
                        {govIdPreview ? (
                          <>
                            <img src={govIdPreview} alt="ID Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-sm font-semibold text-foreground">Click to change image</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <IdCard className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground text-center px-4">
                              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selfie with ID Upload with Preview */}
              <FormField
                control={form.control}
                name="selfieWithGovId"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Selfie Holding ID Card</FormLabel>
                    <FormControl>
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 border-muted-foreground/30 hover:bg-muted/50 hover:border-primary/50 transition-all overflow-hidden relative group">
                        {selfiePreview ? (
                          <>
                            <img src={selfiePreview} alt="Selfie Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-sm font-semibold text-foreground">Click to change image</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UserSquare className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground text-center px-4">
                              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Make sure your face and ID are clear</p>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8">
                {isSubmitting ? (
                  <>
                    <UploadCloud className="w-4 h-4 mr-2 animate-bounce" />
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