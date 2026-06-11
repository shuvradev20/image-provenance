"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, X } from "lucide-react";

import { mintAssetSchema, MintAssetFormValues } from "@/lib/validations/mint";
import { useMintStore } from "@/store/useMintStore";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
            <form id="mint-asset-form" onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ========================================= */}
                    {/* LEFT COLUMN: Image Dropzone               */}
                    {/* ========================================= */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        <FormLabel className="text-base font-semibold">Asset Image</FormLabel>
                        <FormField
                            control={form.control}
                            name="assetImage"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <div 
                                            // FIX: opacity ar pointer-events bad diye shudhu cursor-not-allowed block add kora hoyeche
                                            className={`relative flex flex-col items-center justify-center w-full aspect-square md:aspect-4/3 lg:aspect-square border-2 border-dashed rounded-xl transition-colors ${previewUrl ? 'border-primary/50 bg-background' : 'border-border bg-muted/30 hover:bg-muted/50 cursor-pointer'} ${isMinting ? 'cursor-not-allowed' : ''}`}
                                            onClick={() => !previewUrl && !isMinting && fileInputRef.current?.click()}
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
                                                        className="w-full h-full object-cover rounded-lg shadow-sm"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        disabled={isMinting}
                                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                        className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition shadow-md disabled:cursor-not-allowed"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3">
                                                    <div className="p-4 bg-background rounded-full shadow-sm">
                                                        <UploadCloud className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">Click or Drag & Drop</p>
                                                        <p className="text-sm mt-1">High resolution images (Max 5MB)</p>
                                                        <p className="text-xs mt-2 text-muted-foreground/70">JPEG, PNG, WEBP</p>
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

                    {/* ========================================= */}
                    {/* RIGHT COLUMN: Metadata Form               */}
                    {/* ========================================= */}
                    <div className="lg:col-span-7 flex flex-col space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Asset Title</FormLabel>
                                    <FormControl>
                                        {/* FIX: removed disabled:opacity-60, strictly triggers native disabled blocking with cursor-not-allowed */}
                                        <Input 
                                            disabled={isMinting} 
                                            placeholder="e.g. Cyberpunk Dhaka 2026" 
                                            className="h-12 bg-background disabled:cursor-not-allowed" 
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
                                    <FormLabel className="text-base font-semibold">Description & Story</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            disabled={isMinting}
                                            placeholder="Tell the story behind this digital asset..." 
                                            className="min-h-35 resize-none bg-background disabled:cursor-not-allowed" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>Describe your asset in detail to establish strong provenance.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="assetCategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isMinting}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-background disabled:cursor-not-allowed">
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
                                        <FormLabel className="text-base font-semibold">Tags</FormLabel>
                                        <FormControl>
                                            <Input 
                                                disabled={isMinting}
                                                placeholder="art, futuristic, nature..." 
                                                className="h-12 bg-background disabled:cursor-not-allowed" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">Separate with commas</FormDescription>
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