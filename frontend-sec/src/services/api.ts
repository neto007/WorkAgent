import axios from 'axios';
import { getApiUrl } from '@/lib/env';

const apiUrl = getApiUrl();

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Enable sending cookies
});

// Interceptor to add the token to the Authorization header
// Interceptor to add the token to the Authorization header
api.interceptors.request.use((config) => {
    // We rely on HttpOnly cookies now, so no need to attach Authorization header manually
    // from localStorage.
    return config;
});

// Interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if we have a 401 Unauthorized error
        if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
            // Skip logout for auth endpoints
            const isAuthEndpoint = error.config.url && (
                error.config.url.includes('/auth/login') ||
                error.config.url.includes('/auth/register') ||
                error.config.url.includes('/auth/forgot-password') ||
                error.config.url.includes('/auth/reset-password') ||
                error.config.url.includes('/auth/me')
            );

            if (!isAuthEndpoint) {
                // Clean redirect
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
