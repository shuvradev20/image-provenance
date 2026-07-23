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
            <form id="mint-asset-form" onSubmit={form.handleSubmit(onSubmit)} className="w-full overflow-y-auto max-w-3xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <div className="lg:col-span-5 flex flex-col space-y-2">
                        <FormLabel >Asset</FormLabel>
                        <FormField
                            control={form.control}
                            name="assetImage"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <div 
                                            className={`relative flex flex-col items-center justify-center w-full aspect-square md:aspect-4/3 lg:aspect-square border-2 border-dashed rounded-xl transition-colors ${previewUrl ? 'border-primary bg-background' : 'border-border bg-muted/20 hover:bg-muted/50 cursor-pointer'} ${isMinting ? 'cursor-not-allowed' : ''}`}
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
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        disabled={isMinting}
                                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                        className="absolute top-4 right-4 p-1.5 cursor-pointer rounded-full hover:bg-background/50 hover:text-destructive-foreground transition disabled:cursor-not-allowed"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3">
                                                    <div className="p-4 bg-muted rounded-full">
                                                        <UploadCloud className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className=" text-foreground">Click or Drag & Drop</p>
                                                        <p className="text-xs mt-2 text-muted-foreground/70">Max 5MB (JPEG, PNG, WEBP)</p>
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

                    <div className="lg:col-span-7 flex flex-col space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className=" text-foreground">Asset Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            disabled={isMinting} 
                                            placeholder="Sunset in Dhaka 2026" 
                                            className={`h-12 text-sm bg-muted disabled:cursor-not-allowed ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                                    <FormLabel className=" text-foreground">Description</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            disabled={isMinting}
                                            placeholder="Share the details or story behind this digital asset..." 
                                            className={`min-h-35 text-sm resize-none bg-muted disabled:cursor-not-allowed ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            {...field} 
                                        />
                                    </FormControl>
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
                                        <FormLabel className=" text-foreground">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isMinting}>
                                            <FormControl>
                                                <SelectTrigger 
                                                    className={`h-12 cursor-pointer bg-muted disabled:cursor-not-allowed transition-none ${errors.assetCategory ? 'border-destructive ring-0! ring-offset-0! focus-visible:ring-destructive' : ''}
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
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <Input 
                                                disabled={isMinting}
                                                placeholder="art, cyberpunk, nature..." 
                                                className={`h-12 text-sm bg-muted disabled:cursor-not-allowed ${errors.tags ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">* Separate with commas</FormDescription>
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