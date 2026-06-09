import { create } from "zustand";
import { getPendingKycApi, getUserDetailsApi, getVerifiedUsersApi } from "@/lib/api/admin";

export interface IUserBasic {
    _id: string;
    fullName: string;
    email: string;
    walletAddress: string;
    kycSubmittedAt?: string;
    kycVerifiedAt?: string
}

export interface IUserDetails {
    _id: string;
    fullName: string;
    email: string;
    walletAddress: string;
    governmentId?: string;
    govIdImageUrl?: string;
    selfieWithGovIdUrl?: string;
    kycSubmittedAt?: string;
}

interface KycState {
    recentUsers: IUserBasic[];
    pendingUsers: IUserBasic[];
    pagination: {
        totalUsers: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
    isLoadingPending: boolean;
    isLoadingRecent: boolean;
    selectedUser: IUserDetails | null;
    isLoadingDetails: boolean;
    isPendingModalOpen: boolean;
    setPendingModalOpen: (isOpen: boolean) => void;
    isVerifiedModalOpen: boolean;
    setVerifiedModalOpen: (isOpen: boolean) => void;
    fetchRecentKyc: () => Promise<void>;
    fetchPendingKyc: (page?: number, limit?: number) => Promise<void>;
    fetchUserDetailsForModal: (userId: string) => Promise<void>;
    clearSelectedUser: () => void;
    verifiedUsers: IUserBasic[];
    isLoadingVerified: boolean;
    verifiedPagination: {
        totalUsers: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
    fetchVerifiedUsers: (page?: number, limit?: number) => Promise<void>;
}

export const useKycStore = create<KycState>((set) => ({
    recentUsers: [],
    isLoadingRecent: false,
    pendingUsers: [],
    pagination: { totalUsers: 0, currentPage: 1, totalPages: 1, limit: 10 },
    isLoadingPending: true,
    selectedUser: null,
    isLoadingDetails: false,
    isPendingModalOpen: false,
    isVerifiedModalOpen: false,
    verifiedUsers: [],
    isLoadingVerified: true,
    verifiedPagination: { totalUsers: 0, currentPage: 1, totalPages: 1, limit: 10 },

    setPendingModalOpen: (isOpen) => set({ isPendingModalOpen: isOpen }),
    setVerifiedModalOpen: (isOpen) => set({ isVerifiedModalOpen: isOpen }),

    fetchRecentKyc: async () => {
        set({ isLoadingRecent: true });
        try {
            const response = await getPendingKycApi(1, 5);
            const users = Array.isArray(response.data.users) ? response.data.users.slice(0, 5) : [];
            set({ recentUsers: users, isLoadingRecent: false });
        } catch (error) {
            console.error("Failed to fetch recent KYC:", error);
            set({ recentUsers: [], isLoadingRecent: false });
        }
    },

    fetchPendingKyc: async (page = 1, limit = 10) => {
        set({ isLoadingPending: true });
        try {
            const response = await getPendingKycApi(page, limit);
            const { users, pagination } = response.data;
            
            set({ 
                pendingUsers: users || [], 
                pagination: {
                    totalUsers: pagination?.totalUsers || 0,
                    currentPage: pagination?.currentPage || page,
                    limit: pagination?.limit || limit,
                    totalPages: Math.ceil((pagination?.totalUsers || 0) / (pagination?.limit || limit)) || 1
                },
                isLoadingPending: false 
            });
        } catch (error) {
            console.error("Failed to fetch pending KYC:", error);
            set({ pendingUsers: [], isLoadingPending: false });
        }
    },

    fetchVerifiedUsers: async (page = 1, limit = 10) => {
        set({ isLoadingVerified: true });
        try {
            const response = await getVerifiedUsersApi(page, limit);
            const { users, pagination } = response.data;
            
            set({ 
                verifiedUsers: users || [], 
                verifiedPagination: {
                    totalUsers: pagination?.totalUsers || 0,
                    currentPage: pagination?.currentPage || page,
                    limit: pagination?.limit || limit,
                    totalPages: Math.ceil((pagination?.totalUsers || 0) / (pagination?.limit || limit)) || 1
                },
                isLoadingVerified: false 
            });
        } catch (error) {
            console.error("Failed to fetch verified users:", error);
            set({ verifiedUsers: [], isLoadingVerified: false });
        }
    },

    fetchUserDetailsForModal: async (userId: string) => {
        set({ isLoadingDetails: true, selectedUser: null });
        try {
            const response = await getUserDetailsApi(userId);
            set({ selectedUser: response.data, isLoadingDetails: false });
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            set({ isLoadingDetails: false });
        }
    },

    clearSelectedUser: () => set({ selectedUser: null })
}))