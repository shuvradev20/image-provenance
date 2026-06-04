import api from "../axiosInstance";

export const getCurrentUserProfileApi = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfileInfoApi = async (formData: FormData) => {
    const response = await api.patch('/users/me', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const submitKycVerificationApi = async (formData: FormData) => {
    const response = await api.post('/users/me/kyc', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getUserPublicProfileApi = async (walletAddress: string, page: number = 1, limit: number = 10) => {
    const response = await api.get(`/users/profile/${walletAddress}?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUsersByWalletsApi = async (wallets: string[]) => {
    const response = await api.post('/users/batch', { wallets });
    return response.data;
};

