import { create } from "zustand";
import { uploadAndGenerateProvenanceApi, confirmAndRegisterImageApi } from "@/lib/api/image";
import { signImageMintPayload, mintImageOnChain } from "@/lib/web3";

interface PreMintData {
    imageHash: string;
    watermarkID: string;
    metadataCID: string;
    thumbnailUrl: string;
    ipfsImageUrl: string;
    preparedData: {
        title: string;
        description: string;
        assetCategory: string;
        tags: string[];
        fileDetails: {
            fileType: string;
            fileSize: number;
            width: number;
            height: number;
        };
        originalAssetHash: string;
    };
}

export type MintStepType = 'idle' | 'ipfs_watermark' | 'signature' | 'blockchain' | 'database' | 'success';

interface MintState {
    isMinting: boolean;
    isTrackerVisible: boolean;
    currentStep: MintStepType;
    progressPercent: number;
    mintError: string | null;
    mintedAssetHash: string | null;
    mintedAssetId: string | null;

    setTrackerVisible: (visible: boolean) => void;
    resetMintState: () => void;
    executeMintProcess: (formData: FormData) => Promise<void>;
}

export const useMintStore = create<MintState>((set, get) => ({
    isMinting: false,
    isTrackerVisible: false,
    currentStep: 'idle',
    progressPercent: 0,
    mintError: null,
    mintedAssetHash: null,
    mintedAssetId: null,

    setTrackerVisible: (visible) => set({ isTrackerVisible: visible }),

    resetMintState: () => set({
        isMinting: false,
        isTrackerVisible: false,
        currentStep: 'idle',
        progressPercent: 0,
        mintError: null,
        mintedAssetHash: null,
        mintedAssetId: null,
    }),

    executeMintProcess: async (formData: FormData) => {
        set({
            isMinting: true,
            isTrackerVisible: true,
            currentStep: 'ipfs_watermark',
            progressPercent: 15,
            mintError: null,
            mintedAssetHash: null,
            mintedAssetId: null
        });

        try {
            const preMintResponse = await uploadAndGenerateProvenanceApi(formData);
            const preMintData: PreMintData = preMintResponse.data;

            set({ 
                currentStep: 'signature',
                progressPercent: 40 
            });
            
            const signature = await signImageMintPayload(
                preMintData.imageHash,
                preMintData.watermarkID
            );

            set({ 
                currentStep: 'blockchain',
                progressPercent: 65 
            });

            const txHash = await mintImageOnChain(
                preMintData.imageHash,
                preMintData.watermarkID,
                preMintData.metadataCID,
                signature
            );

            set({ 
                currentStep: 'database',
                progressPercent: 85 
            });

            const finalPayload = {
                title: preMintData.preparedData.title,
                description: preMintData.preparedData.description,
                assetCategory: preMintData.preparedData.assetCategory,
                tags: preMintData.preparedData.tags,
                fileDetails: preMintData.preparedData.fileDetails,
                imageHash: preMintData.imageHash,
                watermarkID: preMintData.watermarkID,
                imageCID: preMintData.ipfsImageUrl.split('/').pop() || '',
                metadataCID: preMintData.metadataCID,
                thumbnailUrl: preMintData.thumbnailUrl,
                transactionHash: txHash,
                originalAssetHash: preMintData.preparedData.originalAssetHash
            };

            const confirmResponse = await confirmAndRegisterImageApi(finalPayload);

            set({
                currentStep: 'success',
                progressPercent: 100,
                mintedAssetHash: preMintData.imageHash,
                mintedAssetId: confirmResponse.data.imageId,
                isMinting: false
            });

        } catch (error: any) {
            console.error("Minting Operation Failed:", error);

            let message = "Provenance pipeline failed.";
            if (error?.response?.data?.message) {
                message = error.response.data.message;
            } else if (error?.reason) {
                message = error.reason;
            } else if (error?.message) {
                message = error.message;
            }

            set({
                mintError: message,
                isMinting: false,
                progressPercent: 0
            });
            
            throw error;
        }
    }
}));