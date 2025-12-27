import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants';
import Cookies from 'js-cookie';
import { COOKIE_KEYS } from '@/constants';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear auth data
        Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
        Cookies.remove(COOKIE_KEYS.USER_DATA);
        
        // Redirect to login (only on client side)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Extract error message
      const errorMessage =
        (error.response.data as any)?.error ||
        (error.response.data as any)?.message ||
        'An error occurred';

      return Promise.reject(new Error(errorMessage));
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

