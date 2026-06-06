import { create } from "zustand";
import { googleAuthApi, getNonceApi, walletLoginApi, logoutUserApi, linkWalletApi } from "@/lib/api/auth";
import { getCurrentUserProfileApi } from "@/lib/api/user";
import { connectToMetaMask, checkAndSwitchNetwork, signWalletLinkMessage, signAuthMessage} from "@/lib/web3";

interface User {
    _id: string;
    fullName?: string;
    email?: string;
    walletAddress?: string;
    bio?: string;
    kycStatus: 'unverified' | 'pending' | 'processing' | 'verified';
    isBlockchainRegistered: boolean;
    profileImage?:string;
    coverImage?: string;
    location?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
        website?: string;
    } | undefined;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    currentActiveWallet: string | null;
    isConnectingWallet: boolean;
    walletError: string | null;
    setUpdatedUser: (updatedData: Partial<User>) => void;
    loginWithGoogle: (googleData: { email: string; fullName: string; googleId: string }) => Promise<void>;
    loginWithWallet: () => Promise<void>;
    checkAuthSession: () => Promise<void>;
    logout: () => Promise<void>;
    linkWalletBackend: () => Promise<void>;
    listenToWalletChanges: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    currentActiveWallet: null,
    isConnectingWallet: false,
    walletError: null,
    
    setUpdatedUser: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null
    })),
    
    loginWithGoogle: async (googleData) => {
        try {
            const response = await googleAuthApi(googleData);
            
            // FIX: response is already ApiResponse, so we access .data.user
            const userData = response.data.user; 
            const savedWallet = userData.walletAddress || null;

            set({ 
                user: userData, 
                isAuthenticated: true,
                currentActiveWallet: savedWallet 
            });
        } catch (error) {
            console.error("Google Login Failed:", error);
            throw error;
        }
    },    

    loginWithWallet: async () => {
        set({
            isConnectingWallet: true, 
            walletError: null
        });

        try {
            const address = await connectToMetaMask();
            await checkAndSwitchNetwork();

            const nonceResponse = await getNonceApi(address);
            // FIX: Corrected path to nonce
            const nonce = nonceResponse.data.nonce; 
            
            const signature = await signAuthMessage(nonce);

            const loginResponse = await walletLoginApi({
                walletAddress: address,
                signature: signature
            });

            // FIX: Corrected path to user
            const userData = loginResponse.data.user;

            set({
                user: userData,
                isAuthenticated: true,
                currentActiveWallet: address,
                isConnectingWallet: false
            })

        } catch (error: any) {
            console.error("Wallet Login Failed:", error);
            set({ 
                walletError: error.response?.data?.message || error.message || "Failed to login with wallet", 
                isConnectingWallet: false 
            });
        }
    },

    checkAuthSession: async () => {
        try {
            const response = await getCurrentUserProfileApi();
            // FIX: Depending on user profile API, it's usually response.data or response.data.user
            const userData = response.data.user || response.data; 
            const savedWallet = userData.walletAddress || null;

            set({ 
                user: userData, 
                isAuthenticated: true, 
                isLoading: false,
                currentActiveWallet: savedWallet
            });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    logout: async () => {
        try {
            await logoutUserApi();
            set({ 
                user: null, 
                isAuthenticated: false, 
                currentActiveWallet: null 
            })

            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    },

    linkWalletBackend: async () => {
        const currentUser = get().user;

        if(!currentUser || !currentUser.email) {
            set({
                walletError: "Please login with Google first."
            });
            return;
        }

        set({
            isConnectingWallet: true, 
            walletError: null
        });

        try {
            const address = await connectToMetaMask();
            await checkAndSwitchNetwork();

            const timestamp = Date.now();
            const signature = await signWalletLinkMessage(currentUser.email, timestamp);
            
            const response = await linkWalletApi({
                walletAddress: address,
                signature: signature,
                timestamp: timestamp
            });

            set({
                currentActiveWallet: address,
                isConnectingWallet: false,
                user: {
                    ...currentUser,
                    // FIX: Corrected path to walletAddress
                    walletAddress: response.data.walletAddress 
                }
            })
        } catch (error: any) {
            console.error("Wallet connection error:", error);
            set({ 
                walletError: error.response?.data?.message || error.message || "Failed to link wallet", 
                isConnectingWallet: false 
            });
        }
    },

    listenToWalletChanges: () => {
        if(typeof window !== 'undefined' && (window as any).ethereum) {
            const eth = (window as any).ethereum;

            eth.on('accountsChanged', (accounts: string[]) => {
                if(accounts.length > 0) {
                    set({currentActiveWallet: accounts[0].toLowerCase()});
                } else {
                    set({currentActiveWallet: null})
                }
            });

            eth.on('chainChanged', () => {
                window.location.reload();
            })
        }
    }
}));