import axiosInstance from './axios';
import { Exam, CreateExamData, ApiResponse, PaginatedResponse } from '@/types';

export const examApi = {
  /**
   * Get all exams
   */
  getExams: async (params?: {
    category?: string;
    language?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ exams: Exam[]; pagination: any }> => {
    const response = await axiosInstance.get<ApiResponse<{ exams: Exam[]; pagination: any }>>('/exams', {
      params,
    });
    // Backend returns { success: true, data: { exams: [...], pagination: {...} } }
    return response.data.data;
  },

  /**
   * Get exam by ID
   */
  getExamById: async (id: string): Promise<Exam> => {
    const response = await axiosInstance.get<ApiResponse<{ exam: Exam }>>(`/exams/${id}`);
    return response.data.data.exam;
  },

  /**
   * Create exam
   */
  createExam: async (data: CreateExamData): Promise<Exam> => {
    const response = await axiosInstance.post<ApiResponse<{ exam: Exam }>>('/exams', data);
    return response.data.data.exam;
  },

  /**
   * Update exam
   */
  updateExam: async (id: string, data: Partial<CreateExamData>): Promise<Exam> => {
    const response = await axiosInstance.put<ApiResponse<{ exam: Exam }>>(`/exams/${id}`, data);
    return response.data.data.exam;
  },

  /**
   * Delete exam
   */
  deleteExam: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/exams/${id}`);
  },

  /**
   * Get tests for an exam
   */
  getExamTests: async (examId: string): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<{ tests: any[] }>>(
      `/exams/${examId}/tests`
    );
    return response.data.data.tests;
  },
};

