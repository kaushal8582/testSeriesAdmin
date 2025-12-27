import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface Referral {
  _id: string;
  referrerId: {
    _id: string;
    name: string;
    email: string;
    referralCode?: string;
  };
  refereeId: {
    _id: string;
    name: string;
    email: string;
  };
  referralCode: string;
  status: 'pending' | 'completed' | 'cancelled';
  referrerReward: {
    type: 'discount' | 'cashback' | 'free_plan';
    value: number;
    applied: boolean;
    appliedAt?: string | null;
  };
  refereeReward: {
    type: 'discount' | 'cashback' | 'free_plan';
    value: number;
    applied: boolean;
    appliedAt?: string | null;
  };
  completedAt?: string | null;
  triggerPaymentId?: {
    _id: string;
    amount: number;
    finalAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const referralApi = {
  /**
   * Get all referrals
   */
  getAllReferrals: async (params?: {
    page?: number;
    limit?: number;
    referrerId?: string;
    status?: string;
  }): Promise<{ referrals: Referral[]; pagination: any }> => {
    const response = await axiosInstance.get<ApiResponse<{ referrals: Referral[]; pagination: any }>>('/referrals', {
      params,
    });
    return response.data.data;
  },
};

