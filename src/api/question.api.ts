import axiosInstance from './axios';
import { Question, CreateQuestionData, BulkQuestionData, ApiResponse, PaginatedResponse } from '@/types';

export const questionApi = {
  /**
   * Get questions for a test
   */
  getQuestions: async (
    testId: string,
    params?: { page?: number; limit?: number; includeAnswers?: boolean }
  ): Promise<{ questions: Question[]; pagination: any }> => {
    const response = await axiosInstance.get<ApiResponse<{ questions: Question[]; pagination: any }>>(
      '/questions',
      {
        params: { testId, ...params },
      }
    );
    // Backend returns { success: true, data: { questions: [...], pagination: {...} } }
    return response.data.data;
  },

  /**
   * Get question by ID
   */
  getQuestionById: async (id: string): Promise<Question> => {
    const response = await axiosInstance.get<ApiResponse<{ question: Question }>>(
      `/questions/${id}`
    );
    return response.data.data.question;
  },

  /**
   * Create question
   */
  createQuestion: async (data: CreateQuestionData): Promise<Question> => {
    const response = await axiosInstance.post<ApiResponse<{ question: Question }>>(
      '/questions',
      data
    );
    return response.data.data.question;
  },

  /**
   * Bulk create questions
   */
  bulkCreateQuestions: async (questions: CreateQuestionData[]): Promise<Question[]> => {
    const response = await axiosInstance.post<ApiResponse<{ questions: Question[] }>>(
      '/questions/bulk',
      { questions }
    );
    return response.data.data.questions;
  },

  /**
   * Update question
   */
  updateQuestion: async (id: string, data: Partial<CreateQuestionData>): Promise<Question> => {
    const response = await axiosInstance.put<ApiResponse<{ question: Question }>>(
      `/questions/${id}`,
      data
    );
    return response.data.data.question;
  },

  /**
   * Delete question
   */
  deleteQuestion: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/questions/${id}`);
  },
};

