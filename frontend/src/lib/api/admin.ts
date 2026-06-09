import adminApi from "../adminAxiosInstance"; // Apnar path onujayi ektu check kore niben

export const loginAdminApi = async (credentials: { email: string; password: string }) => {
    const response = await adminApi.post('/admin/sessions', credentials);
    return response.data;
};

export const getCurrentAdminApi = async () => {
    const response = await adminApi.get('/admin/me');
    return response.data;
};

export const logoutAdminApi = async () => {
    const response = await adminApi.delete('/admin/sessions');
    return response.data;
};

export const getDashboardStatsApi = async () => {
    const response = await adminApi.get('/admin/dashboard-stats');
    return response.data;
};

export const getPendingKycApi = async (page: number = 1, limit: number = 10) => {
    const response = await adminApi.get(`/admin/pending-kyc?page=${page}&limit=${limit}`);
    return response.data;
};

export const approveKycApi = async (userId: string) => {
    const response = await adminApi.post('/admin/approve-kyc', { userId });
    return response.data;
};

export const rejectKycApi = async (userId: string, reason: string) => {
    const response = await adminApi.post('/admin/reject-kyc', { userId, reason });
    return response.data;
};

export const getVerifiedUsersApi = async (page: number = 1, limit: number = 20) => {
    const response = await adminApi.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUserDetailsApi = async (userId: string) => {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data;
};

export const createAdminApi = async (adminData: { fullName: string; email: string; password: string }) => {
    const response = await adminApi.post('/admin/create', adminData);
    return response.data;
};

export const getAdminListApi = async (page: number = 1, limit: number = 10) => {
    const response = await adminApi.get(`/admin/list?page=${page}&limit=${limit}`);
    return response.data;
};

export const deleteAdminApi = async (adminId: string) => {
    const response = await adminApi.delete(`/admin/${adminId}`);
    return response.data;
};