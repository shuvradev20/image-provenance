import axios from 'axios';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const adminApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

adminApi.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => { 
        const originalRequest = error.config;
        const isLoginRequest = originalRequest.url?.includes('/admin/sessions') && originalRequest.method === 'post';

        if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    `${BASE_URL}/admin/sessions/refresh`,
                    {},
                    { withCredentials: true }
                );

                return adminApi(originalRequest);
            } catch (refreshError) {
                console.error("Admin session expired. Please log in again.");

                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login'; 
                }
            }
        }

        return Promise.reject(error);
    }
);

export default adminApi;