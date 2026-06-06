import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Arbitrum Sepolia Testnet Details
const TARGET_CHAIN_ID = 421614; 
const TARGET_CHAIN_HEX = '0x66eee';
const PROVENODE_CONTRACT_ADDRESS = "0xe8dE3089dCFf50b247C5e801D43830460C98f17B";

const PROVENODE_ABI = [
    "function registerImage(bytes32 _imageHash, bytes32 _watermarkID, string calldata _metadataCID, bytes calldata _signature) external",
    "function imageExists(bytes32) view returns (bool)",
    "event ImageRegistered(address indexed creator, bytes32 indexed hash, bytes32 watermarkID, string metadataCID)"
];

export const getProvider = () => {
    if(typeof window === 'undefined' || !window.ethereum) {
        throw new Error("Please install MetaMask to continue.");
    }

    return new ethers.BrowserProvider(window.ethereum);
};

export const connectToMetaMask = async (): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
};

export const checkAndSwitchNetwork = async (): Promise<void> => {
    const provider = getProvider();
    const network = await provider.getNetwork();

    if(network.chainId !== BigInt(TARGET_CHAIN_ID)) {
        try {
            await provider.send('wallet_switchEthereumChain', [{chainId: TARGET_CHAIN_HEX}]);
        } catch (switchError: any) {
            if (switchError.error?.code === 4902 || switchError.code === 4902 || switchError.info?.error?.code === 4902) {
                try {
                    console.log("Network not found. Adding Arbitrum Sepolia network...");
                    await provider.send('wallet_addEthereumChain', [
                        {
                            chainId: TARGET_CHAIN_HEX,
                            chainName: 'Arbitrum Sepolia',
                            rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'], 
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            blockExplorerUrls: ['https://sepolia.arbiscan.io/'] 
                        },
                    ]);
                } catch (addError) {
                    console.error("Failed to add network", addError);
                    throw new Error("Failed to add Arbitrum Sepolia network. Please add it manually.");
                }
            } else {
                console.error("Network switch failed", switchError);
                throw new Error("Please switch to the Arbitrum Sepolia network in your wallet.");
            }
        }
    }
};

// PATH A: for google user
export const signWalletLinkMessage = async (email: string, timestamp: number): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const message = `Link wallet to ProveNode account: ${email} | Time: ${timestamp}`;
    return await signer.signMessage(message);
};

export const signAuthMessage = async (nonce: string): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.signMessage(nonce);
};

export const getProveNodeContract = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(PROVENODE_CONTRACT_ADDRESS, PROVENODE_ABI, signer);
};

export const signImageMintPayload = async (imageHash: string, watermarkIDRaw: string): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const formattedWatermarkID = ethers.zeroPadValue("0x" + watermarkIDRaw.replace("0x", ""), 32);

    const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [imageHash, formattedWatermarkID]
    );

    const signature = await signer.signMessage(ethers.getBytes(messageHash));

    return signature;
};

export const mintImageOnChain = async (
    imageHash: string,
    watermarkIDRaw: string,
    metadataCID: string,
    signature: string
): Promise<string> => {
    await checkAndSwitchNetwork();

    const contract = await getProveNodeContract();
    const provider = getProvider();
    const formattedWatermarkID = ethers.zeroPadValue("0x" + watermarkIDRaw.replace("0x", ""), 32);

    let gasOverrides = {};
    try {
        const feeData = await provider.getFeeData();
        
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            const optimalMaxFee = (feeData.maxFeePerGas * BigInt(135)) / BigInt(100);
            const optimalPriorityFee = (feeData.maxPriorityFeePerGas * BigInt(120)) / BigInt(100);

            gasOverrides = {
                maxFeePerGas: optimalMaxFee,
                maxPriorityFeePerGas: optimalPriorityFee
            };
        }
    } catch (feeError) {
        console.warn("Dynamic gas estimation lagged, using MetaMask defaults:", feeError);
    }

    console.log("Sending transaction to blockchain with optimized gas overrides...");
    const tx = await contract.registerImage(
        imageHash,
        formattedWatermarkID,
        metadataCID,
        signature,
        gasOverrides
    );

    console.log("Transaction sent! Hash:", tx.hash);

    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
        return tx.hash;
    } else {
        throw new Error("Transaction failed on the blockchain.");
    }
};






