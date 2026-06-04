import api from "@/lib/axiosInstance";

export const googleAuthApi = async (googleData: { email: string; fullName: string; googleId: string }) => {
    const response = await api.post('/auth/sessions/google', googleData);
    return response.data;
};

export const linkWalletApi = async (walletData: { walletAddress: string; signature: string; timestamp: number }) => {
    const response = await api.put('/auth/users/me/wallet', walletData);
    return response.data;
};

export const getNonceApi = async (walletAddress: string) => {
    const response = await api.get(`/auth/wallets/${walletAddress}/nonce`);
    return response.data;
};

export const walletLoginApi = async (loginData: { walletAddress: string; signature: string }) => {
    const response = await api.post('/auth/sessions/wallet', loginData);
    return response.data;
};

export const refreshAccessTokenApi = async () => {
    const response = await api.post('/auth/sessions/refresh');
    return response.data;
};

export const logoutUserApi = async () => {
    const response = await api.delete('/auth/session');
    return response.data;
};