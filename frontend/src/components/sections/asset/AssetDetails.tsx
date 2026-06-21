"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit2, Loader2, CheckCircle2, Flame } from "lucide-react";
import { updateMetadataOnChain } from "@/lib/web3";

import { editMetadataSchema, EditMetadataFormValues } from "@/lib/validations/asset";
import { prepareMetadataUpdateApi, confirmMetadataUpdateApi } from "@/lib/api/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AssetDetailsProps {
    asset: any;
    isOwner: boolean;
    onUpdateSuccess: () => void;
    onlyHeader?: boolean;
}

export default function AssetDetails({ asset, isOwner, onUpdateSuccess, onlyHeader = false }: AssetDetailsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EditMetadataFormValues>({
        resolver: zodResolver(editMetadataSchema),
        defaultValues: {
            title: asset.title,
            description: asset.description,
            assetCategory: asset.assetCategory,
            tags: asset.tags ? asset.tags.join(", ") : "",
        },
    });

    const onSubmit = async (values: EditMetadataFormValues) => {
    try {
        setIsSubmitting(true);
        toast.loading("Preparing new IPFS metadata...", { id: "edit-tx" });

        // 1. Backend e draft toiri kora
        const draftRes = await prepareMetadataUpdateApi((asset.hash || asset.imageHash), values);
        const { newMetadataCID } = draftRes.data;

        toast.loading("Please sign the transaction...", { id: "edit-tx" });
        
        // 2. Web3 function ta directly call kora
        const txHash = await updateMetadataOnChain((asset.hash || asset.imageHash), newMetadataCID);
        
        toast.loading("Syncing with database...", { id: "edit-tx" });

        // 3. Backend e confirm kora
        await confirmMetadataUpdateApi((asset.hash || asset.imageHash), {
            newMetadataCID,
            transactionHash: txHash,
        });

        toast.success("Metadata updated successfully!", { id: "edit-tx" });
        setIsEditing(false);
        onUpdateSuccess();
    } catch (error: any) {
        console.error("Full Error Object:", error);
        toast.error(error?.message || error?.reason || "Failed to update.", { id: "edit-tx" });
    } finally {
        setIsSubmitting(false);
    }
};

    // IDENTITY & STORY (Borderless, Flush Design)
    if (onlyHeader) {
        return (
            <div className="relative group animate-in fade-in transition-all w-full pb-8 border-b border-border/20">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        
                        {/* Title & Category Row */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-4">
                                {/* Title and Badge */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    {isEditing ? (
                                        <FormField control={form.control} name="title" render={({ field }) => (
                                            <FormItem className="flex-1 min-w-[200px]">
                                                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Asset Title</FormLabel>
                                                <FormControl>
                                                    <Input className="text-2xl font-bold bg-muted/30 border-transparent focus:border-border h-12" {...field} disabled={isSubmitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    ) : (
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            {asset.title}
                                        </h1>
                                    )}

                                    {!isEditing && (
                                        asset.status === 'burned' ? (
                                            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-transparent py-1 px-3 pointer-events-none">
                                                <Flame className="w-3.5 h-3.5 mr-1.5" />
                                                Burned
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent transition-colors py-1 px-3">
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                Authentic
                                            </Badge>
                                        )
                                    )}
                                </div>

                                {/* Category */}
                                {isEditing ? (
                                    <FormField control={form.control} name="assetCategory" render={({ field }) => (
                                        <FormItem className="w-full sm:w-1/2">
                                            <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/30 border-transparent w-full">
                                                        <SelectValue placeholder="Category" />
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
                                    )} />
                                ) : (
                                    <span className="text-muted-foreground text-[13px] font-semibold tracking-wider uppercase block">
                                        {asset.assetCategory.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {/* Hover Edit Button */}
                            {!isEditing && isOwner && asset.status !== 'burned' && (
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-muted rounded-full h-9 w-9 shrink-0"
                                >
                                    <Edit2 className="w-4 h-4 text-foreground/70" />
                                </Button>
                            )}
                        </div>

                        {/* Description Section */}
                        {isEditing ? (
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Description</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[120px] bg-muted/30 border-transparent focus:border-border resize-none" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ) : (
                            <div className="space-y-2 mt-2">
                                <p className="text-foreground/80 leading-relaxed text-[15px] whitespace-pre-wrap font-medium">
                                    {asset.description}
                                </p>
                            </div>
                        )}

                        {/* Tags Section */}
                        <div className="space-y-2">
                            {isEditing ? (
                                <FormField control={form.control} name="tags" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Tags</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tags (comma separated)" className="bg-muted/30 border-transparent focus:border-border" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            ) : (
                                asset.tags && asset.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {asset.tags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/10 px-3 py-1 border-border/30 rounded-full">
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Action Buttons (Only visible while editing) */}
                        {isEditing && (
                            <div className="flex gap-3 justify-end pt-6 mt-4 border-t border-border/20">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </div>
        );
    }

    // TECHNICAL SPECS (Borderless, Flush Design)
    return (
        <div className="w-full pt-4">
            <h3 className="text-base font-semibold mb-6 tracking-tight text-foreground/90 uppercase text-muted-foreground">Technical Details</h3>
            <div className="flex flex-col gap-1">
                {asset.fileDetails && (
                    <>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-[14px] text-muted-foreground">Resolution</span>
                            <span className="text-[14px] font-medium text-foreground">{asset.fileDetails.width} × {asset.fileDetails.height} px</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-[14px] text-muted-foreground">Format</span>
                            <span className="text-[14px] font-medium uppercase text-foreground">{asset.fileDetails.fileType}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-[14px] text-muted-foreground">File Size</span>
                            <span className="text-[14px] font-medium text-foreground">{(asset.fileDetails.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}