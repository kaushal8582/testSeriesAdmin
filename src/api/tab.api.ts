import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface Tab {
  _id: string;
  name: string;
  examId: string;
  order: number;
  isDefault: boolean;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTabData {
  name: string;
  examId: string;
  order: number;
  isDefault?: boolean;
  description?: string;
}

export const tabApi = {
  /**
   * Get all tabs for an exam
   */
  getTabs: async (examId: string): Promise<Tab[]> => {
    const response = await axiosInstance.get<ApiResponse<{ tabs: Tab[] }>>('/tabs', {
      params: { examId },
    });
    return response.data.data.tabs;
  },

  /**
   * Get tab by ID
   */
  getTabById: async (id: string): Promise<Tab> => {
    const response = await axiosInstance.get<ApiResponse<{ tab: Tab }>>(`/tabs/${id}`);
    return response.data.data.tab;
  },

  /**
   * Create tab
   */
  createTab: async (data: CreateTabData): Promise<Tab> => {
    const response = await axiosInstance.post<ApiResponse<{ tab: Tab }>>('/tabs', data);
    return response.data.data.tab;
  },

  /**
   * Update tab
   */
  updateTab: async (id: string, data: Partial<CreateTabData>): Promise<Tab> => {
    const response = await axiosInstance.put<ApiResponse<{ tab: Tab }>>(`/tabs/${id}`, data);
    return response.data.data.tab;
  },

  /**
   * Delete tab
   */
  deleteTab: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tabs/${id}`);
  },
};

