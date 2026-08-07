import axios from 'axios';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post(
                    `${BASE_URL}/auth/sessions/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data?.data?.accessToken;

                if (newAccessToken && typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                console.error("Session expired. Please log in again.");

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken'); 
                    window.location.href = '/'; 
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;