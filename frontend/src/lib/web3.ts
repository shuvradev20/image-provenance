import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import { getConnection, signMessage, switchChain, getConnectorClient } from '@wagmi/core';
import { config } from '@/config';
import { arbitrumSepolia } from '@reown/appkit/networks';
import type { Client, Chain, Transport } from 'viem';


export function clientToProvider(client: Client<Transport, Chain>) {
    const { chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address
    };
    return new BrowserProvider(transport, network);
}

export async function getEthersSigner() {
    const client = await getConnectorClient(config);
    const provider = clientToProvider(client);
    const signer = new JsonRpcSigner(provider, client.account.address);
    return signer;
}

export const connectToMetaMask = async (): Promise<string> => {
    const connection = getConnection(config);
    if (!connection.address) {
        throw new Error("Please connect your wallet using the AppKit button first.");
    }
    return connection.address.toLowerCase();
};

export const checkAndSwitchNetwork = async (): Promise<void> => {
    const connection = getConnection(config);
    if (connection.chainId !== arbitrumSepolia.id) {
        await switchChain(config, { chainId: arbitrumSepolia.id });
    }
};

export const signWalletLinkMessage = async (email: string, timestamp: number): Promise<string> => {
    const message = `Link wallet to ProveNode account: ${email} | Time: ${timestamp}`;
    return await signMessage(config, { message });
};

export const signAuthMessage = async (nonce: string): Promise<string> => {
    return await signMessage(config, { message: nonce });
};

export const getProveNodeContract = async () => {
    const signer = await getEthersSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const signImageMintPayload = async (imageHash: string, watermarkIDRaw: string): Promise<string> => {
    const formattedWatermarkID = ethers.zeroPadValue("0x" + watermarkIDRaw.replace("0x", ""), 4);

    const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes4"],
        [imageHash, formattedWatermarkID]
    );

    return await signMessage(config, { message: { raw: ethers.getBytes(messageHash) } });
};

const getOptimizedGasOverrides = async (provider: BrowserProvider) => {
    try {
        const feeData = await provider.getFeeData();
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            return {
                maxFeePerGas: (feeData.maxFeePerGas * BigInt(135)) / BigInt(100),
                maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * BigInt(120)) / BigInt(100)
            };
        }
    } catch (feeError) {
        console.warn("Dynamic gas estimation lagged, using defaults:", feeError);
    }
    return {};
};

export const mintImageOnChain = async (
    imageHash: string,
    watermarkIDRaw: string,
    metadataCID: string,
    signature: string
): Promise<string> => {
    await checkAndSwitchNetwork();

    const contract = await getProveNodeContract();
    const signer = await getEthersSigner();
    const formattedWatermarkID = ethers.zeroPadValue("0x" + watermarkIDRaw.replace("0x", ""), 4);
    const gasOverrides = await getOptimizedGasOverrides(signer.provider as BrowserProvider);

    const tx = await contract.registerImage(
        imageHash,
        formattedWatermarkID,
        metadataCID,
        signature,
        gasOverrides
    );

    const receipt = await tx.wait();
    
    if (receipt.status === 1) return tx.hash;
    throw new Error("Transaction failed on the blockchain.");
};

export const updateMetadataOnChain = async (
    imageHash: string,
    newMetadataCID: string
): Promise<string> => {
    await checkAndSwitchNetwork(); 
    
    const contract = await getProveNodeContract();
    const signer = await getEthersSigner();
    const gasOverrides = await getOptimizedGasOverrides(signer.provider as BrowserProvider);

    const tx = await contract.updateMetadata(
        imageHash,
        newMetadataCID,
        gasOverrides
    );

    const receipt = await tx.wait();
    
    if (receipt.status === 1) return tx.hash;
    throw new Error("Transaction failed on the blockchain.");
};

export const transferImageOnChain = async (
    imageHash: string,
    newOwnerWallet: string
): Promise<string> => {
    await checkAndSwitchNetwork();
    const contract = await getProveNodeContract();
    const signer = await getEthersSigner();
    const gasOverrides = await getOptimizedGasOverrides(signer.provider as BrowserProvider);

    const tx = await contract.transferImage(imageHash, newOwnerWallet, gasOverrides);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) return tx.hash;
    throw new Error("Transfer failed on the blockchain.");
};

export const burnImageOnChain = async (imageHash: string): Promise<string> => {
    await checkAndSwitchNetwork();
    const contract = await getProveNodeContract();
    const signer = await getEthersSigner();
    const gasOverrides = await getOptimizedGasOverrides(signer.provider as BrowserProvider);

    const tx = await contract.burnImage(imageHash, gasOverrides);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) return tx.hash;
    throw new Error("Burn failed on the blockchain.");
};