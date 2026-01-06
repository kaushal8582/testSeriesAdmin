import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface DailyChallenge {
  _id: string;
  date: string;
  challengeType: 'daily_test' | 'accuracy' | 'speed' | 'category_focus' | 'streak';
  title: string;
  description: string;
  target: number;
  targetCategory?: string;
  targetTest?: {
    _id: string;
    testName: string;
  };
  reward: {
    xp: number;
    coins: number;
  };
  examIds?: Array<{
    _id: string;
    title: string;
  }>;
  participantsCount: number;
  completionsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyChallengeData {
  date: string;
  challengeType: 'daily_test' | 'accuracy' | 'speed' | 'category_focus' | 'streak';
  title: string;
  description: string;
  target: number;
  targetCategory?: string;
  targetTest?: string;
  reward?: {
    xp: number;
    coins: number;
  };
  examIds?: string[];
  isActive?: boolean;
}

export const dailyChallengeApi = {
  /**
   * Get all daily challenges (Admin only)
   */
  getAllChallenges: async (params?: {
    date?: string;
    isActive?: boolean;
  }): Promise<DailyChallenge[]> => {
    const response = await axiosInstance.get<ApiResponse<DailyChallenge[]>>(
      '/daily-challenges/admin/all',
      { params }
    );
    return response.data.data;
  },

  /**
   * Create daily challenge (Admin only)
   */
  createChallenge: async (data: CreateDailyChallengeData): Promise<DailyChallenge> => {
    const response = await axiosInstance.post<ApiResponse<DailyChallenge>>(
      '/daily-challenges/admin/create',
      data
    );
    return response.data.data;
  },

  /**
   * Update daily challenge (Admin only)
   */
  updateChallenge: async (
    challengeId: string,
    data: Partial<CreateDailyChallengeData>
  ): Promise<DailyChallenge> => {
    const response = await axiosInstance.put<ApiResponse<DailyChallenge>>(
      `/daily-challenges/admin/${challengeId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete daily challenge (Admin only)
   */
  deleteChallenge: async (challengeId: string): Promise<void> => {
    await axiosInstance.delete(`/daily-challenges/admin/${challengeId}`);
  },
};

