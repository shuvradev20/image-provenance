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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  const [transferError, setTransferError] = useState<string | null>(null);
  const [burnError, setBurnError] = useState<string | null>(null);

  const transferForm = useForm<TransferAssetFormValues>({
    resolver: zodResolver(transferAssetSchema),
    defaultValues: { newOwnerWallet: "" },
  });

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "0x0000...0000";
    return `${addr.slice(0, 20)}...${addr.slice(-6)}`;
  };

  const onTransferSubmit = async (values: TransferAssetFormValues) => {
    try {
      setTransferError(null);

      if (values.newOwnerWallet.toLowerCase() === asset.currentOwner?.toLowerCase()) {
        setTransferError("You cannot transfer the asset to your own wallet.");
        return;
      }
      setIsTransferring(true);
      toast.loading("Please sign the transfer transaction...", { id: "transfer-tx" });

      const txHash = await transferImageOnChain(asset.hash || asset.imageHash, values.newOwnerWallet);

      toast.loading("Syncing transfer with ProveNode database...", { id: "transfer-tx" });

      await confirmImageTransferApi(asset.hash || asset.imageHash, {
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

      const txHash = await burnImageOnChain(asset.hash || asset.imageHash);

      toast.loading("Syncing burn status with ProveNode database...", { id: "burn-tx" });

      await confirmImageBurnApi(asset.hash || asset.imageHash, {
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

  if (asset.status === "burned") {
    return (
      <div className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl p-4 sm:p-5 w-full">
        <div
          className="rounded-lg p-4 flex items-start gap-3 mb-5 border"
          style={{
            backgroundColor: "color-mix(in oklch, var(--status-error) 8%, transparent)",
            borderColor: "color-mix(in oklch, var(--status-error) 25%, transparent)",
          }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--status-error)" }} />
          <div>
            <h4 className="font-semibold text-xs uppercase font-mono mb-1" style={{ color: "var(--status-error)" }}>
              Asset Burned
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This asset has been permanently destroyed on the blockchain. The invisible DNA remains locked to prevent re-minting, but all ownership rights have been revoked.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Minted By</p>
            <div className="flex items-center justify-between gap-2 w-full">
              <span
                className="font-mono text-xs text-foreground tracking-tight block sm:hidden truncate"
                title={asset.uploader || "0x0000000000000000000000000000000000000000"}
              >
                {formatAddress(asset.uploader)}
              </span>
              <span
                className="font-mono text-xs text-foreground tracking-tight hidden sm:block truncate min-w-0"
                title={asset.uploader || "0x0000000000000000000000000000000000000000"}
              >
                {asset.uploader || "0x0000000000000000000000000000000000000000"}
              </span>

              <button
                onClick={() => handleCopy(asset.uploader, "uploader")}
                title="Copy uploader address"
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
              >
                {copiedField === "uploader" ? <CopyCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="w-full">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Current Owner</p>
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="font-mono text-xs text-foreground tracking-tight" title="0x0000000000000000000000000000000000000000">
                0x0000...0000
              </span>
              <Badge
                variant="outline"
                className="border-transparent text-[10px] font-mono px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: "color-mix(in oklch, var(--status-error) 12%, transparent)",
                  color: "var(--status-error)",
                }}
              >
                Burned Address
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-100/50 dark:bg-zinc-900 border border-border rounded-xl p-4 sm:p-5 w-full">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Minted By</p>
          <div className="flex items-center justify-between gap-2 w-full">
            <span
              className="font-mono text-xs text-foreground tracking-tight block sm:hidden truncate"
              title={asset.uploader || "0x0000000000000000000000000000000000000000"}
            >
              {formatAddress(asset.uploader)}
            </span>
            <span
              className="font-mono text-xs text-foreground tracking-tight hidden sm:block truncate min-w-0"
              title={asset.uploader || "0x0000000000000000000000000000000000000000"}
            >
              {asset.uploader || "0x0000000000000000000000000000000000000000"}
            </span>

            <button
              onClick={() => handleCopy(asset.uploader, "uploader")}
              title="Copy uploader address"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
            >
              {copiedField === "uploader" ? <CopyCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="w-full">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Current Owner</p>
          <div className="flex items-center justify-between gap-2 w-full">
            <span
              className="font-mono text-xs text-foreground tracking-tight block sm:hidden truncate"
              title={asset.currentOwner || "0x0000000000000000000000000000000000000000"}
            >
              {formatAddress(asset.currentOwner)}
            </span>
            <span
              className="font-mono text-xs text-foreground tracking-tight hidden sm:block truncate min-w-0"
              title={asset.currentOwner || "0x0000000000000000000000000000000000000000"}
            >
              {asset.currentOwner || "0x0000000000000000000000000000000000000000"}
            </span>

            <button
              onClick={() => handleCopy(asset.currentOwner, "owner")}
              title="Copy owner address"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
            >
              {copiedField === "owner" ? <CopyCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {isOwner && asset.status !== "burned" && (
        <div className="flex flex-col gap-4 mt-5 pt-4">
          <div className="bg-zinc-200/30 dark:bg-zinc-800/30 rounded-lg p-3.5">
            <h4 className="text-xs font-semibold text-foreground tracking-tight">Transfer Asset</h4>
            <hr className="border-border mt-2 mb-2.5" />

            {transferError && (
              <div
                className="w-full mb-3 p-2.5 rounded-md flex items-start gap-2 text-xs font-mono"
                style={{
                  backgroundColor: "color-mix(in oklch, var(--status-error) 10%, transparent)",
                  borderColor: "color-mix(in oklch, var(--status-error) 30%, transparent)",
                  color: "var(--status-error)",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{transferError}</p>
              </div>
            )}

            <Form {...transferForm}>
              <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="flex flex-col sm:flex-row gap-2 items-start">
                <div className="flex-1 w-full">
                  <FormField
                    control={transferForm.control}
                    name="newOwnerWallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="0x(Recipient Wallet)"
                            className="font-mono text-xs bg-background/80 h-9 rounded-md placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-border transition-colors autofill:bg-transparent [&:-webkit-autofill]:[transition-delay:9999s]"
                            {...field}
                            disabled={isTransferring || isBurning}
                            />
                        </FormControl>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Info className="w-3 h-3 shrink-0" />
                          <p>Provide valid Ethereum address</p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button title="Transfer Asset" type="submit" disabled={isTransferring || isBurning} size="sm" className="w-full sm:w-auto h-9 text-xs rounded-md">
                  {isTransferring ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                  Transfer
                </Button>
              </form>
            </Form>
          </div>

          <div>
            {burnError && (
              <div
                className="w-full mb-3 p-2.5 rounded-md flex items-start gap-2 text-xs font-mono"
                style={{
                  backgroundColor: "color-mix(in oklch, var(--status-error) 10%, transparent)",
                  borderColor: "color-mix(in oklch, var(--status-error) 30%, transparent)",
                  color: "var(--status-error)",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{burnError}</p>
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  title="Burn this asset permanently"
                  className="w-full text-xs rounded-md border-transparent hover:border-transparent transition-colors"
                  style={{
                    backgroundColor: "color-mix(in oklch, var(--status-error) 10%, transparent)",
                    color: "var(--status-error)",
                  }}
                >
                  <Flame className="w-3.5 h-3.5 mr-1.5" /> Burn Asset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md rounded-xl bg-card border border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base font-semibold tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs leading-relaxed mt-1 text-muted-foreground">
                    This action cannot be undone. This will permanently burn the asset <strong className="text-foreground">{asset.title}</strong> on the blockchain and revoke all ownership.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row justify-end items-center gap-2 mt-4">
                  <AlertDialogCancel disabled={isBurning} className="text-xs h-8 rounded-md">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBurnAsset}
                    disabled={isBurning}
                    className="text-xs h-8 rounded-md text-white border-transparent"
                    style={{ backgroundColor: "var(--status-error)" }}
                  >
                    {isBurning ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Flame className="w-3.5 h-3.5 mr-1" />}
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