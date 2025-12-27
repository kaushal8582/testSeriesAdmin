import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
}

export const categoryApi = {
  /**
   * Get all categories
   */
  getCategories: async (params?: { isActive?: boolean; includeInactive?: boolean }): Promise<Category[]> => {
    const response = await axiosInstance.get<ApiResponse<{ categories: Category[] }>>('/categories', {
      params,
    });
    return response.data.data.categories;
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get<ApiResponse<{ category: Category }>>(`/categories/${id}`);
    return response.data.data.category;
  },

  /**
   * Create category
   */
  createCategory: async (data: CreateCategoryData | FormData): Promise<Category> => {
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {};
    const response = await axiosInstance.post<ApiResponse<{ category: Category }>>('/categories', data, config);
    return response.data.data.category;
  },

  /**
   * Update category
   */
  updateCategory: async (id: string, data: Partial<CreateCategoryData> | FormData): Promise<Category> => {
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {};
    const response = await axiosInstance.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, data, config);
    return response.data.data.category;
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};

