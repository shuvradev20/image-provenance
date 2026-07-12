"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit2, Loader2, CheckCircle2, Flame, AlertCircle } from "lucide-react";
import { updateMetadataOnChain } from "@/lib/web3";
import { editMetadataSchema, EditMetadataFormValues } from "@/lib/validations/asset";
import { prepareMetadataUpdateApi, confirmMetadataUpdateApi } from "@/lib/api/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatWalletError } from "@/lib/errors/walletErrors";


interface AssetDetailsProps {
    asset: any;
    isOwner: boolean;
    onUpdateSuccess: () => void;
    onlyHeader?: boolean;
}

export default function AssetDetails({ asset, isOwner, onUpdateSuccess, onlyHeader = false }: AssetDetailsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);

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
            setTxError(null);
            setIsSubmitting(true);
            toast.loading("Preparing new IPFS metadata...", { id: "edit-tx" });

            const draftRes = await prepareMetadataUpdateApi((asset.hash || asset.imageHash), values);
            const { newMetadataCID } = draftRes.data;

            toast.loading("Please sign the transaction...", { id: "edit-tx" });

            const txHash = await updateMetadataOnChain((asset.hash || asset.imageHash), newMetadataCID);
            
            toast.loading("Syncing with database...", { id: "edit-tx" });
            await confirmMetadataUpdateApi((asset.hash || asset.imageHash), {
                newMetadataCID,
                transactionHash: txHash,
            });

            toast.success("Metadata updated successfully!", { id: "edit-tx" });
            setIsEditing(false);
            onUpdateSuccess();
        } catch (error: any) {
            setTxError(formatWalletError(error));
            toast.dismiss("edit-tx");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (onlyHeader) {
        return (
            <div className="relative group animate-in fade-in transition-all w-full pb-8 border-b border-border/20">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {isEditing ? (
                                        <FormField control={form.control} name="title" render={({ field }) => (
                                            <FormItem className="flex-1 min-w-50">
                                                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Asset Title</FormLabel>
                                                <FormControl>
                                                    <Input className="text-2xl font-bold bg-transparent border border-border focus:border-foreground/50 h-12" {...field} disabled={isSubmitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    ) : (
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground capitalize">
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

                                {isEditing ? (
                                    <FormField control={form.control} name="assetCategory" render={({ field }) => (
                                        <FormItem className="w-full sm:w-1/2">
                                            <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-transparent border border-border w-full">
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
                                    <span className="text-foreground/60 text-[13px] tracking-widest uppercase block">
                                        {asset.assetCategory.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

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

                        {isEditing ? (
                            <div className="mt-4">
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Description</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-30 bg-transparent border border-border focus:border-foreground/50 resize-none" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        ) : (
                           <div className="space-y-2">
                                <h3 className="text-lg text-foreground">Description</h3>
                                <hr className="border-border/70" />
                                <p className="text-foreground/60 leading-relaxed text-[14px] whitespace-pre-wrap">
                                    {asset.description}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {isEditing ? (
                                <FormField control={form.control} name="tags" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Tags</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tags (comma separated)" className="bg-transparent border border-border focus:border-foreground/50" {...field} disabled={isSubmitting}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            ) : (
                                asset.tags && asset.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {asset.tags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs font-normal text-foreground/60 bg-muted/10 px-3 py-1 border-border/50 rounded-full">
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>



                        {isEditing && (
                            <div className="pt-4 mt-2 border-t border-border/20">
                                
                                {txError && (
                                    <div className="w-full mb-4 p-4 rounded-xl flex items-start gap-3 
                                        bg-red-50 text-red-600 border border-red-100 
                                        dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 
                                        animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium leading-relaxed">
                                            {txError}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 justify-end">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setTxError(null);
                                        }} 
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="min-w-30">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </div>
        );
    }

    return (
        <div className="w-full pt-6">
            <div className="space-y-2">
                <h3 className="text-lg text-foreground">Technical Details</h3>
                <hr className="border-border/70" />
            </div>

            <div className="flex flex-col gap-3 pt-2">
                {asset.fileDetails && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-[14px] text-foreground/60">Resolution</span>
                            <span className="text-[14px] text-foreground/60">{asset.fileDetails.width} × {asset.fileDetails.height} px</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[14px] text-foreground/60">Format</span>
                            <span className="text-[14px] uppercase text-foreground/60">{asset.fileDetails.fileType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[14px] text-foreground/60">File Size</span>
                            <span className="text-[14px] text-foreground/60">{(asset.fileDetails.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}