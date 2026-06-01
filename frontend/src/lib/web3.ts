import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Arbitrum Sepolia Testnet Details
const TARGET_CHAIN_ID = 421614; 
const TARGET_CHAIN_HEX = '0x66eee';

export const getProvider = () => {
    if(typeof window === 'undefined' || !window.ethereum) {
        throw new Error("Please install MetaMask to continue.");
    }

    return new ethers.BrowserProvider(window.ethereum);
}

export const connectToMetaMask = async (): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
}

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
}

// PATH A: for google user
export const signWalletLinkMessage = async (email: string, timestamp: number): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const message = `Link wallet to ProveNode account: ${email} | Time: ${timestamp}`;
    return await signer.signMessage(message);
}

export const signAuthMessage = async (nonce: string): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.signMessage(nonce);
}



