import { create } from "zustand";
import { loginAdminApi, getCurrentAdminApi, logoutAdminApi, getAdminListApi, createAdminApi, deleteAdminApi } from "@/lib/api/admin";

interface AdminUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'superAdmin' | 'admin';
    createdAt?: string;
}

interface AdminAuthState {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    adminError: string | null;

    adminsList: AdminUser[];
    isLoadingAdmins: boolean;
    isCreateModalOpen: boolean;
    adminPagination: {
        totalAdmins: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
    
    loginAdmin: (credentials: { email: string; password: string }) => Promise<void>;
    checkAdminSession: () => Promise<void>;
    logoutAdmin: () => Promise<void>;

    setCreateModalOpen: (isOpen: boolean) => void;
    fetchAdmins: (page?: number, limit?: number) => Promise<void>;
    createNewAdmin: (adminData: { fullName: string; email: string; password: string }) => Promise<void>;
    removeAdmin: (adminId: string) => Promise<void>;
}

export const useAdminStore = create<AdminAuthState>((set, get) => ({
    admin: null,
    isAuthenticated: false,
    isLoading: true,
    adminError: null,

    adminsList: [],
    isLoadingAdmins: true,
    isCreateModalOpen: false,
    adminPagination: { totalAdmins: 0, currentPage: 1, totalPages: 1, limit: 10 },

    loginAdmin: async (credentials) => {
        set({ adminError: null });

        try {
            const response = await loginAdminApi(credentials); 
            const adminData = response.data.admin;

            set({
                admin: adminData,
                isAuthenticated: true,
            });
        } catch (error: any) {
            console.error("Admin Login Failed:", error);
            set({ 
                adminError: error.response?.data?.message || "Failed to login admin" 
            });
            throw error;
        }
    },

    checkAdminSession: async () => {
        try {
            const response = await getCurrentAdminApi(); 
            const adminData = response.data;

            set({
                admin: adminData,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ admin: null, isAuthenticated: false, isLoading: false });
        }
    },

    logoutAdmin: async () => {
        try {
            await logoutAdminApi(); 
            set({ admin: null, isAuthenticated: false });

            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
        } catch (error) {
            console.error("Admin logout failed", error);
        }
    },

    setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

    fetchAdmins: async (page = 1, limit = 10) => {
        set({ isLoadingAdmins: true });
        try {
            const response = await getAdminListApi(page, limit);
            const { admins, pagination } = response.data;

            set({ 
                adminsList: admins || [], 
                adminPagination: {
                    totalAdmins: pagination?.totalAdmins || 0,
                    currentPage: pagination?.currentPage || page,
                    limit: pagination?.limit || limit,
                    totalPages: Math.ceil((pagination?.totalAdmins || 0) / (pagination?.limit || limit)) || 1
                },
                isLoadingAdmins: false 
            });
        } catch (error) {
            console.error("Failed to fetch admin list:", error);
            set({ adminsList: [], isLoadingAdmins: false });
        }
    },

    createNewAdmin: async (adminData) => {
        try {
            await createAdminApi(adminData);
            await get().fetchAdmins(); 
        } catch (error: any) {
            console.error("Failed to create admin:", error);
            throw error;
        }
    },

    removeAdmin: async (adminId) => {
        try {
            await deleteAdminApi(adminId);
            const currentList = get().adminsList;
            set({ adminsList: currentList.filter(admin => admin._id !== adminId) });
        } catch (error: any) {
            console.error("Failed to delete admin:", error);
            throw error;
        }
    }
}))