"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, Flame, Loader2, Copy, CopyCheck, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { transferAssetSchema, TransferAssetFormValues } from "@/lib/validations/asset";
import { confirmImageTransferApi, confirmImageBurnApi } from "@/lib/api/image";
import { transferImageOnChain, burnImageOnChain } from "@/lib/web3";
import { formatWalletError } from "@/lib/errors/walletErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";

interface AssetOwnershipControlsProps {
    asset: any;
    isOwner: boolean;
    onUpdateSuccess: () => void;
}

export default function AssetOwnershipControls({ asset, isOwner, onUpdateSuccess }: AssetOwnershipControlsProps) {
    const [isTransferring, setIsTransferring] = useState(false);
    const [isBurning, setIsBurning] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [transferError, setTransferError] = useState<string | null>(null);
    const [burnError, setBurnError] = useState<string | null>(null);
    
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
            setTransferError(null); 
            
            if (values.newOwnerWallet.toLowerCase() === asset.currentOwner.toLowerCase()) {
                setTransferError("You cannot transfer the asset to your own wallet.");
                return; 
            }
            setIsTransferring(true);
            toast.loading("Please sign the transfer transaction...", { id: "transfer-tx" });

            const txHash = await transferImageOnChain((asset.hash || asset.imageHash), values.newOwnerWallet);
            
            toast.loading("Syncing transfer with ProveNode database...", { id: "transfer-tx" });

            await confirmImageTransferApi((asset.hash || asset.imageHash), {
                newOwnerWallet: values.newOwnerWallet,
                transactionHash: txHash,
            });

            toast.success("Asset ownership transferred successfully!", { id: "transfer-tx" });
            transferForm.reset();
            onUpdateSuccess();

        } catch (error: any) {
            setTransferError(formatWalletError(error));
            toast.dismiss("transfer-tx");
        } finally {
            setIsTransferring(false);
        }
    };

    const handleBurnAsset = async () => {
        try {
            setBurnError(null);
            setIsBurning(true);
            toast.loading("Please sign the burn transaction...", { id: "burn-tx" });

            const txHash = await burnImageOnChain((asset.hash || asset.imageHash));
            
            toast.loading("Syncing burn status with ProveNode database...", { id: "burn-tx" });

            await confirmImageBurnApi((asset.hash || asset.imageHash), {
                transactionHash: txHash,
            });

            toast.success("Asset burned permanently!", { id: "burn-tx" });
            onUpdateSuccess();

        } catch (error: any) {
            setBurnError(formatWalletError(error));
            toast.dismiss("burn-tx");
        } finally {
            setIsBurning(false);
        }
    };

    if (asset.status === 'burned') {
        return (
            <div className="bg-card border border-border rounded-2xl p-6 w-full">
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 flex items-start gap-4 mb-6">
                    <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-destructive font-semibold text-base mb-1">Asset Burned</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            This asset has been permanently destroyed on the blockchain. The invisible DNA remains locked to prevent re-minting, but all ownership rights have been revoked.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="w-full">
                        <p className="text-sm text-muted-foreground mb-1">Minted By</p>
                        <div className="flex items-center gap-3 w-full">
                            <div className="min-w-0 flex-1">
                                <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
                                    {asset.uploader || "0x0000000000000000000000000000000000000000"}
                                </p>
                            </div>
                            <button onClick={() => handleCopy(asset.uploader, 'uploader')} className="text-muted-foreground hover:text-foreground shrink-0">
                                {copiedField === 'uploader' ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="w-full">
                        <p className="text-sm text-muted-foreground mb-1">Current Owner</p>
                        <div className="flex items-center gap-3 w-full">
                            <div className="min-w-0 flex-1">
                                <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
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

    return (
        <div className="bg-card border border-border rounded-2xl p-6 w-full">
            <div className="flex flex-col gap-5">
                <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-1">Minted By</p>
                    <div className="flex items-center gap-3 w-full">
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
                                {asset.uploader || "0x0000000000000000000000000000000000000000"}
                            </p>
                        </div>
                        <button onClick={() => handleCopy(asset.uploader, 'uploader')} className="text-muted-foreground hover:text-foreground shrink-0">
                            {copiedField === 'uploader' ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-1">Current Owner</p>
                    <div className="flex items-center gap-3 w-full">
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
                                {asset.currentOwner || "0x0000000000000000000000000000000000000000"}
                            </p>
                        </div>
                        <button onClick={() => handleCopy(asset.currentOwner, 'owner')} className="text-muted-foreground hover:text-foreground shrink-0">
                            {copiedField === 'owner' ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

            </div>

            {isOwner && asset.status !== 'burned' && (
                <div className="flex flex-col gap-5 mt-6">
                    <div className="bg-muted/50 dark:bg-muted/50 border border-border rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-foreground">Transfer Asset</h4>
                        <div className="h-px bg-border w-full my-3" />
                        
                        {transferError && (
                            <div className="w-full mb-4 p-3.5 rounded-xl flex items-start gap-3 
                                bg-red-50 text-red-600 border border-red-100 
                                dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 
                                animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium leading-relaxed">
                                    {transferError}
                                </p>
                            </div>
                        )}
                        
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
                                                        placeholder="0x(Recipient Wallet)" 
                                                        className="font-mono text-sm font-medium bg-background/80 h-10 placeholder:text-muted-foreground/60 dark:placeholder:text-muted-foreground/50"
                                                        {...field} 
                                                        disabled={isTransferring || isBurning} 
                                                    />
                                                </FormControl>
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

                    <div className="mt-2">
                        {burnError && (
                            <div className="w-full mb-4 p-3.5 rounded-xl flex items-start gap-3 
                                bg-red-50 text-red-600 border border-red-100 
                                dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 
                                animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium leading-relaxed">
                                    {burnError}
                                </p>
                            </div>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:hover:bg-red-900/40">
                                    <Flame className="w-4 h-4 mr-2" /> Burn Asset
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-125 rounded-xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm leading-relaxed mt-2">
                                        This action cannot be undone. This will permanently burn the asset <strong className="text-foreground font-semibold">"{asset.title}"</strong> on the blockchain and remove your ownership rights.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isBurning}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBurnAsset} disabled={isBurning} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-800 border-transparent">
                                        {isBurning ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Flame className="w-4 h-4 mr-2" />
                                        )}
                                        Yes, Burn it
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