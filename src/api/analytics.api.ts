import axiosInstance from './axios';
import { TestAnalytics, ExamAnalytics, TestAttempt, ApiResponse, PaginatedResponse } from '@/types';

export const analyticsApi = {
  /**
   * Get test analytics
   */
  getTestAnalytics: async (testId: string): Promise<TestAnalytics> => {
    const response = await axiosInstance.get<ApiResponse<{ analytics: TestAnalytics }>>(
      `/analytics/test/${testId}`
    );
    return response.data.data.analytics;
  },

  /**
   * Get exam analytics
   */
  getExamAnalytics: async (examId: string): Promise<ExamAnalytics> => {
    const response = await axiosInstance.get<ApiResponse<{ analytics: ExamAnalytics }>>(
      `/analytics/exam/${examId}`
    );
    return response.data.data.analytics;
  },

  /**
   * Get test leaderboard
   */
  getTestLeaderboard: async (
    testId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<any>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
      `/analytics/test/${testId}/leaderboard`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get test attempts
   */
  getTestAttempts: async (params?: {
    testId?: string;
    examId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<TestAttempt>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<TestAttempt>>>(
      '/test-attempts',
      { params }
    );
    return response.data.data;
  },
};

