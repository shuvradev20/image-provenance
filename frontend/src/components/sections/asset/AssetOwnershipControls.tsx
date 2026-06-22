"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, Flame, Loader2, Copy, Check, Info, AlertTriangle } from "lucide-react";

import { transferAssetSchema, TransferAssetFormValues } from "@/lib/validations/asset";
import { confirmImageTransferApi, confirmImageBurnApi } from "@/lib/api/image";
import { transferImageOnChain, burnImageOnChain } from "@/lib/web3"; // Web3 Imports

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AssetOwnershipControlsProps {
    asset: any;
    isOwner: boolean;
    onUpdateSuccess: () => void;
}

export default function AssetOwnershipControls({ asset, isOwner, onUpdateSuccess }: AssetOwnershipControlsProps) {
    const [isTransferring, setIsTransferring] = useState(false);
    const [isBurning, setIsBurning] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const transferForm = useForm<TransferAssetFormValues>({
        resolver: zodResolver(transferAssetSchema),
        defaultValues: { newOwnerWallet: "" },
    });

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const onTransferSubmit = async (values: TransferAssetFormValues) => {
        try {
            setIsTransferring(true);
            toast.loading("Please sign the transfer transaction...", { id: "transfer-tx" });

            // 1. Web3 transfer
            const txHash = await transferImageOnChain((asset.hash || asset.imageHash), values.newOwnerWallet);
            
            toast.loading("Syncing transfer with ProveNode database...", { id: "transfer-tx" });

            // 2. Backend confirm
            await confirmImageTransferApi((asset.hash || asset.imageHash), {
                newOwnerWallet: values.newOwnerWallet,
                transactionHash: txHash,
            });

            toast.success("Asset ownership transferred successfully!", { id: "transfer-tx" });
            transferForm.reset();
            onUpdateSuccess();

        } catch (error: any) {
            console.error("Transfer failed:", error);
            toast.error(error?.message || error?.reason || "Failed to transfer asset.", { id: "transfer-tx" });
        } finally {
            setIsTransferring(false);
        }
    };

    const handleBurnAsset = async () => {
        try {
            setIsBurning(true);
            toast.loading("Please sign the burn transaction...", { id: "burn-tx" });

            // 1. Web3 burn
            const txHash = await burnImageOnChain((asset.hash || asset.imageHash));
            
            toast.loading("Syncing burn status with ProveNode database...", { id: "burn-tx" });

            // 2. Backend confirm
            await confirmImageBurnApi((asset.hash || asset.imageHash), {
                transactionHash: txHash,
            });

            toast.success("Asset burned permanently!", { id: "burn-tx" });
            onUpdateSuccess();

        } catch (error: any) {
            console.error("Burn failed:", error);
            toast.error(error?.message || error?.reason || "Failed to burn asset.", { id: "burn-tx" });
        } finally {
            setIsBurning(false);
        }
    };

    // BURNED UI STATE (Inside your original card design)
    if (asset.status === 'burned') {
        return (
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm w-full">
                
                {/* Burn Warning Banner */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 flex items-start gap-4 mb-6">
                    <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-destructive font-semibold text-base mb-1">Asset Burned</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            This asset has been permanently destroyed on the blockchain. The invisible DNA remains locked to prevent re-minting, but all ownership rights have been revoked.
                        </p>
                    </div>
                </div>

                {/* Creators & Owners Info */}
                <div className="flex flex-col gap-5">
                    
                    {/* Minted By (Remains Intact - Original Design) */}
                    <div className="w-full">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Minted By</p>
                        <div className="flex items-center gap-3 w-full">
                            <div className="min-w-0 flex-1">
                                <p className="font-mono text-[14px] text-foreground truncate">
                                    {asset.uploader || "0x0000000000000000000000000000000000000000"}
                                </p>
                            </div>
                            <button onClick={() => handleCopy(asset.uploader, 'uploader')} className="text-muted-foreground hover:text-foreground shrink-0">
                                {copiedField === 'uploader' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Current Owner (Zero Address / Burned - Original Design) */}
                    <div className="w-full">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Current Owner</p>
                        <div className="flex items-center gap-3 w-full">
                            <div className="min-w-0 flex-1">
                                <p className="font-mono text-[14px] text-destructive truncate">
                                    0x0000000000000000000000000000000000000000
                                </p>
                            </div>
                            <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-xs shrink-0">
                                Burned Address
                            </Badge>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // NORMAL UI STATE (Exactly your original design)
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm w-full">
            
            {/* Creators & Owners Info (No boxes, normal text with bulletproof truncation) */}
            <div className="flex flex-col gap-5">
                
                {/* Minted By */}
                <div className="w-full">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Minted By</p>
                    <div className="flex items-center gap-3 w-full">
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[14px] text-foreground truncate">
                                {asset.uploader || "0x0000000000000000000000000000000000000000"}
                            </p>
                        </div>
                        <button onClick={() => handleCopy(asset.uploader, 'uploader')} className="text-muted-foreground hover:text-foreground shrink-0">
                            {copiedField === 'uploader' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Current Owner */}
                <div className="w-full">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Current Owner</p>
                    <div className="flex items-center gap-3 w-full">
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[14px] text-foreground truncate">
                                {asset.currentOwner || "0x0000000000000000000000000000000000000000"}
                            </p>
                        </div>
                        <button onClick={() => handleCopy(asset.currentOwner, 'owner')} className="text-muted-foreground hover:text-foreground shrink-0">
                            {copiedField === 'owner' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

            </div>

            {/* Owner Exclusive Controls */}
            {isOwner && asset.status !== 'burned' && (
                <div className="flex flex-col gap-5 mt-6">
                    
                    {/* Nested Transfer Asset Card - Padding Reduced */}
                    <div className="bg-background/40 border border-border/50 rounded-xl p-4">
                        <h4 className="text-base font-semibold text-foreground">Transfer Asset</h4>
                        
                        {/* The Divider Line */}
                        <div className="h-px bg-border/50 w-full my-3" />
                        
                        <Form {...transferForm}>
                            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="flex-1 w-full">
                                    <FormField
                                        control={transferForm.control}
                                        name="newOwnerWallet"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="0x... (Recipient Wallet Address)" 
                                                        className="font-mono text-[14px] bg-background/80 h-10"
                                                        {...field} 
                                                        disabled={isTransferring || isBurning} 
                                                    />
                                                </FormControl>
                                                {/* Information Text */}
                                                <div className="flex items-start gap-1.5 text-[12px] text-muted-foreground mt-1 ml-1">
                                                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    <p>Please provide a receiver wallet address</p>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={isTransferring || isBurning} className="w-full sm:w-auto h-10">
                                    {isTransferring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Transfer
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Burn Zone */}
                    <div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isTransferring || isBurning} className="shadow-sm">
                                    <Flame className="w-4 h-4 mr-2" /> Burn Asset
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently burn the asset <strong>"{asset.title}"</strong> on the blockchain and remove your ownership rights.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isBurning}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBurnAsset} disabled={isBurning} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        {isBurning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Yes, Burn it"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                </div>
            )}
        </div>
    );
}