import axios from 'axios';
import { responseCookiesToRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

api.interceptors.response.use(
    (response) => {
        return response
    },
    async(error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    `${BASE_URL}/auth/sessions/refresh`,
                    {},
                    { withCredentials: true }
                );

                return api(originalRequest)
            } catch (refreshError) {
                console.error("Session expired. Please log in again.");

                if (typeof window !== 'undefined') {
                    window.location.href = '/'; 
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;