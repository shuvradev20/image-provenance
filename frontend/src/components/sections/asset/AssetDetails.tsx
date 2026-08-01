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
            <div className="relative group animate-in fade-in transition-all w-full pb-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {isEditing ? (
                                        <FormField 
                                            control={form.control} 
                                            name="title" 
                                            render={({ field }) => (
                                                <FormItem className="flex-1 min-w-50">
                                                    <FormLabel className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider">Asset Title</FormLabel>
                                                    <FormControl>
                                                        <Input className="text-xs bg-transparent border border-border focus:border-foreground/50 h-10 rounded-md" {...field} disabled={isSubmitting} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                        )} />
                                    ) : (
                                        <h1 className="text-sm md:text-base font-semibold tracking-tight text-foreground capitalize">
                                            {asset.title}
                                        </h1>
                                    )}

                                    {!isEditing && (
                                        asset.status === 'burned' ? (
                                            <Badge 
                                                variant="secondary" 
                                                title="Asset Burned Permanently"
                                                className="border border-transparent py-0.5 px-2.5 rounded-md font-mono text-[10px] font-medium transition-colors"
                                                style={{
                                                    backgroundColor: "color-mix(in oklch, var(--status-error) 12%, transparent)",
                                                    color: "var(--status-error)",
                                                    }}
                                                >
                                                <Flame className="w-3 h-3 mr-1" />
                                                Burned
                                            </Badge>
                                        ) : (
                                            <Badge 
                                                variant="secondary" 
                                                title="Authentic Cryptographic Proof"
                                                className="border border-transparent py-0.5 px-2.5 rounded-md font-mono text-[10px] font-medium transition-colors"
                                                style={{
                                                    backgroundColor: "color-mix(in oklch, var(--status-success) 12%, transparent)",
                                                    color: "var(--status-success)",
                                                }}
                                            >
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Authentic
                                            </Badge>
                                        )
                                    )}
                                </div>

                                {isEditing ? (
                                    <FormField 
                                        control={form.control} 
                                        name="assetCategory" 
                                        render={({ field }) => (
                                        <FormItem className="w-full sm:w-1/2">
                                            <FormLabel className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-transparent border border-border rounded-md w-full text-xs">
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
                                    <span className="text-muted-foreground text-[10px] font-mono tracking-wider uppercase block">
                                        {asset.assetCategory.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {!isEditing && isOwner && asset.status !== 'burned' && (
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon" 
                                    title="Edit asset metadata"
                                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 rounded-md h-8 w-8 shrink-0"
                                >
                                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="mt-2">
                                <FormField 
                                    control={form.control} 
                                    name="description" 
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider">Description</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-24 bg-transparent border border-border focus:border-foreground/50 rounded-md text-xs resize-none" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        ) : (
                           <div className="space-y-1.5 pt-1">
                                <h3 className="text-sm font-medium text-foreground">Description</h3>
                                <p className="text-muted-foreground leading-relaxed text-xs whitespace-pre-wrap">
                                    {asset.description}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {isEditing ? (
                                <FormField control={form.control} name="tags" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider">Tags</FormLabel>
                                        <FormControl>
                                            <Input placeholder="comma, separated, tags" className="bg-transparent border border-border text-xs rounded-md" {...field} disabled={isSubmitting}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            ) : (
                                asset.tags && asset.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {asset.tags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-[10px] font-mono text-muted-foreground bg-zinc-200/30 dark:bg-zinc-900/50 px-2 py-0.5 border-border rounded-md">
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>


                        {isEditing && (
                            <div className="pt-3 border-t border-border">
                                {txError && (
                                    <div
                                        className="w-full mb-3 p-3 rounded-md flex items-start gap-2.5 text-xs font-mono"
                                        style={{
                                        backgroundColor: "color-mix(in oklch, var(--status-error) 10%, transparent)",
                                        borderColor: "color-mix(in oklch, var(--status-error) 30%, transparent)",
                                        color: "var(--status-error)",
                                        }}
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">{txError}</p>
                                    </div>
                                    )}

                                <div className="flex gap-2 justify-end">
                                    <Button 
                                        type="button" 
                                        title="Cancel"
                                        variant="ghost" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setTxError(null);
                                        }} 
                                        disabled={isSubmitting}
                                        className="cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button title="Save Changes" type="submit" disabled={isSubmitting} className="min-w-24 cursor-pointer text-xs rounded-md">
                                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : "Save Changes"}
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
        <div className="w-full pt-2 space-y-3">
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">Technical Details</h3>
                <hr className="border-border" />
            </div>

            <div className="flex flex-col gap-2 font-mono text-[10px] sm:text-xs">
                {asset.fileDetails && (
                <>
                    <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">Resolution</span>
                    <span className="text-foreground">
                        {asset.fileDetails.width} × {asset.fileDetails.height} px
                    </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">Format</span>
                    <span className="text-foreground uppercase">{asset.fileDetails.fileType}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">File Size</span>
                    <span className="text-foreground">
                        {(asset.fileDetails.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                    </div>
                </>
                )}
            </div>
        </div>
    );
}