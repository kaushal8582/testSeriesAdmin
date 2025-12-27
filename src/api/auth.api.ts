import axiosInstance from './axios';
import { AuthResponse, User, ApiResponse } from '@/types';

export const authApi = {
  /**
   * Admin login
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse['data']>>(
      '/auth/login',
      { email, password }
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Login successful',
      data: response.data.data,
    };
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },

  /**
   * Logout (client-side only, clears cookies)
   */
  logout: () => {
    // Cookies are cleared in the component
  },
};

