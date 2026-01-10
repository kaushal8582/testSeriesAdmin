import axiosInstance from './axios';
import { Test, CreateTestData, ApiResponse, PaginatedResponse } from '@/types';

export const testApi = {
  /**
   * Get all tests for an exam
   */
  getTests: async (
    examId: string,
    params?: { page?: number; limit?: number; tabId?: string; includeInactive?: boolean }
  ): Promise<{ tests: Test[]; pagination: any }> => {
    const response = await axiosInstance.get<ApiResponse<{ tests: Test[]; pagination: any }>>('/tests', {
      params: { examId, ...params },
    });
    // Backend returns { success: true, data: { tests: [...], pagination: {...} } }
    return response.data.data;
  },

  /**
   * Get test by ID
   */
  getTestById: async (id: string): Promise<Test> => {
    const response = await axiosInstance.get<ApiResponse<{ test: Test }>>(`/tests/${id}`);
    return response.data.data.test;
  },

  /**
   * Create test
   */
  createTest: async (data: CreateTestData): Promise<Test> => {
    const response = await axiosInstance.post<ApiResponse<{ test: Test }>>('/tests', data);
    return response.data.data.test;
  },

  /**
   * Update test
   */
  updateTest: async (id: string, data: Partial<CreateTestData>): Promise<Test> => {
    const response = await axiosInstance.put<ApiResponse<{ test: Test }>>(`/tests/${id}`, data);
    return response.data.data.test;
  },

  /**
   * Delete test
   */
  deleteTest: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tests/${id}`);
  },
};

