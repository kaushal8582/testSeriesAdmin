import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  profilePicture?: string;
  totalTestsAttempted: number;
  totalTestsCompleted: number;
  averageScore: number;
  trackingInfo?: {
    ipAddress?: string;
    ipAddresses?: Array<{ ip: string; timestamp: string }>;
    deviceInfo?: {
      userAgent?: string;
      platform?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
    };
    location?: {
      country?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    };
    loginHistory?: Array<{
      ipAddress: string;
      userAgent: string;
      deviceType: string;
      location: {
        country?: string;
        region?: string;
        city?: string;
      };
      timestamp: string;
      loginMethod: string;
    }>;
    lastLoginAt?: string;
    lastLoginIp?: string;
    lastActivityAt?: string;
    appVersion?: string;
    appPlatform?: string;
    networkInfo?: {
      connectionType?: string;
      isp?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const userApi = {
  /**
   * Get all users
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<UserListResponse> => {
    const response = await axiosInstance.get<ApiResponse<UserListResponse>>('/users', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data.data.user;
  },

  /**
   * Update user role
   */
  updateUserRole: async (id: string, role: 'USER' | 'ADMIN'): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(`/users/${id}/role`, {
      role,
    });
    return response.data.data.user;
  },

  /**
   * Update user status
   */
  updateUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(`/users/${id}/status`, {
      isActive,
    });
    return response.data.data.user;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};

