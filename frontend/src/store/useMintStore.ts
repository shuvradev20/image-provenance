import { create } from "zustand";
import { uploadAndGenerateProvenanceApi, confirmAndRegisterImageApi } from "@/lib/api/image";
import { signImageMintPayload, mintImageOnChain } from "@/lib/web3";
import { formatWalletError } from "@/lib/errors/walletErrors";

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

export type MintStepType = 'idle' | 'analyzing_image' | 'injecting_dna' | 'uploading_ipfs' | 'awaiting_wallet' | 'verifying_signature' | 'minting_blockchain' | 'syncing_database' | 'success';

interface MintState {
    isMinting: boolean;
    isTrackerVisible: boolean;
    currentStep: MintStepType;
    progressPercent: number;
    mintError: string | null;
    mintedAssetHash: string | null;
    mintedAssetId: string | null;
    lastFailedStep: MintStepType | null;

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
    lastFailedStep: null,

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
            currentStep: 'analyzing_image',
            progressPercent: 15,
            mintError: null,
            mintedAssetHash: null,
            mintedAssetId: null
        });

        let isApiResolved = false;

        const simulateBackendSteps = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!isApiResolved) set({ currentStep: 'injecting_dna', progressPercent: 30 });
            
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            if (!isApiResolved) set({ currentStep: 'uploading_ipfs', progressPercent: 40 });
        };
        simulateBackendSteps();

        try {
            const preMintResponse = await uploadAndGenerateProvenanceApi(formData);
            const preMintData: PreMintData = preMintResponse.data;

            isApiResolved = true;

            set({ 
                currentStep: 'awaiting_wallet',
                progressPercent: 50
            });
            
            const signature = await signImageMintPayload(
                preMintData.imageHash,
                preMintData.watermarkID
            );

            set({ 
                currentStep: 'verifying_signature',
                progressPercent: 60
            });

            set({ 
                currentStep: 'minting_blockchain',
                progressPercent: 70 
            });

            const txHash = await mintImageOnChain(
                preMintData.imageHash,
                preMintData.watermarkID,
                preMintData.metadataCID,
                signature
            );

            set({ 
                currentStep: 'syncing_database',
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
            isApiResolved = true;

            const userMessage = error?.response?.data?.message || formatWalletError(error) || "Something went wrong.";

            set({
                mintError: userMessage,
                isMinting: false,
                lastFailedStep: get().currentStep,
                progressPercent: 0,
            });
            
            throw error;
        }
    }
}));