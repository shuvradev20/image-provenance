import axios from 'axios';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const adminApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

adminApi.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminAccessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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
                const refreshResponse = await axios.post(
                    `${BASE_URL}/admin/sessions/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;

                if (newAccessToken && typeof window !== 'undefined') {
                    localStorage.setItem('adminAccessToken', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return adminApi(originalRequest);
            } catch (refreshError) {
                console.error("Admin session expired. Please log in again.");

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('adminAccessToken'); 
                    window.location.href = '/admin/login'; 
                }
            }
        }

        return Promise.reject(error);
    }
);
export default adminApi;