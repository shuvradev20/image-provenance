"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, X } from "lucide-react";
import { mintAssetSchema, MintAssetFormValues } from "@/lib/validations/asset";
import { useMintStore } from "@/store/useMintStore";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MintAssetForm() {
    const { executeMintProcess, isMinting } = useMintStore();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<MintAssetFormValues>({
        resolver: zodResolver(mintAssetSchema),
        defaultValues: {
            title: "",
            description: "",
            tags: "",
        },
    });

    const { errors } = form.formState;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("assetImage", file, { shouldValidate: true });
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const removeImage = () => {
        form.setValue("assetImage", undefined, { shouldValidate: true });
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (values: MintAssetFormValues) => {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("assetCategory", values.assetCategory);
        if (values.tags) {
            formData.append("tags", values.tags);
        }
        formData.append("image", values.assetImage);

        await executeMintProcess(formData);
    };

    return (
        <Form {...form}>
            <form 
            id="mint-asset-form" 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="w-full max-w-3xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 flex flex-col space-y-2">
                        <FormLabel className="text-xs font-medium text-foreground">Asset</FormLabel>
                        <FormField
                            control={form.control}
                            name="assetImage"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <div
                                            title={
                                                previewUrl
                                                ? "Selected asset image"
                                                : "Click or Drag & Drop to upload an image"
                                            }
                                            className={`relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-xl transition-all ${
                                                previewUrl
                                                ? "border-primary bg-background"
                                                : "border-border bg-muted/20 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 cursor-pointer"
                                            } ${isMinting ? "cursor-not-allowed opacity-70" : ""}`}
                                            onClick={() =>
                                                !previewUrl &&
                                                !isMinting &&
                                                fileInputRef.current?.click()
                                            }
                                            >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                disabled={isMinting}
                                                accept="image/jpeg, image/jpg, image/png, image/webp"
                                                onChange={handleImageChange}
                                            />

                                            {previewUrl ? (
                                                <div className="relative w-full h-full p-2">
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Asset Preview" 
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        title="Remove selected image" 
                                                        type="button" 
                                                        disabled={isMinting}
                                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                        className="absolute top-4 right-4 p-1.5 cursor-pointer rounded-full bg-background/80 hover:bg-background text-foreground hover:text-destructive border border-border transition disabled:cursor-not-allowed"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3">
                                                    <div className="p-3 bg-muted rounded-full">
                                                        <UploadCloud className="w-7 h-7 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-foreground">Click or Drag & Drop</p>
                                                        <p className="text-[10px] font-mono mt-1 text-muted-foreground">
                                                            Max 5MB (JPEG, PNG, WEBP)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="lg:col-span-7 flex flex-col space-y-5">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-foreground">Asset Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            disabled={isMinting} 
                                            placeholder="Sunset in Dhaka 2026" 
                                            className={`h-11 text-sm bg-muted/50 border-border disabled:cursor-not-allowed ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-foreground">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        disabled={isMinting}
                                        placeholder="Share the details or story behind this digital asset..."
                                        className={`min-h-32 text-sm resize-none bg-muted/50 border-border disabled:cursor-not-allowed ${
                                            errors.description
                                            ? "border-destructive focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="assetCategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium text-foreground">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isMinting}>
                                            <FormControl>
                                                <SelectTrigger 
                                                    title="Select category"
                                                    className={`h-11 cursor-pointer bg-muted/50 border border-border focus:ring-1 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed ${
                                                        errors.assetCategory
                                                        ? "border-destructive focus:ring-destructive"
                                                        : ""
                                                    }`}
                                                >
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="photography">Photography</SelectItem>
                                                <SelectItem value="digital_art">Digital Art</SelectItem>
                                                <SelectItem value="ai_generated">AI Generated</SelectItem>
                                                <SelectItem value="illustration">Illustration</SelectItem>
                                                <SelectItem value="news_media">News & Media</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs font-medium text-foreground">
                                        Tags
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                        autoComplete="off"
                                        disabled={isMinting}
                                        placeholder="art, cyberpunk, nature..."
                                        className={`h-11 text-sm bg-muted/50 border-border disabled:cursor-not-allowed [&:-webkit-autofill]:bg-transparent ${
                                            errors.tags
                                            ? "border-destructive focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[10px] font-mono text-muted-foreground">
                                        * Separate with commas
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}