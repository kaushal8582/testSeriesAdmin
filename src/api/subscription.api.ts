import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description?: string;
  planType: 'free' | 'basic' | 'premium' | 'lifetime';
  duration: number | null;
  durationLabel: string;
  price: number;
  currency: string;
  trialPeriod: number;
  features: string[];
  order: number;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanData {
  name: string;
  description?: string;
  planType: 'free' | 'basic' | 'premium' | 'lifetime';
  duration: number | null;
  durationLabel: string;
  price: number;
  currency?: string;
  trialPeriod?: number;
  features?: string[];
  order?: number;
  isPopular?: boolean;
}

export const subscriptionPlanApi = {
  /**
   * Get all subscription plans
   */
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await axiosInstance.get<ApiResponse<{ plans: SubscriptionPlan[] }>>('/subscriptions/plans');
    return response.data.data.plans;
  },

  /**
   * Create subscription plan
   */
  createPlan: async (data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> => {
    const response = await axiosInstance.post<ApiResponse<{ plan: SubscriptionPlan }>>('/subscriptions/plans', data);
    return response.data.data.plan;
  },

  /**
   * Update subscription plan
   */
  updatePlan: async (id: string, data: Partial<CreateSubscriptionPlanData>): Promise<SubscriptionPlan> => {
    const response = await axiosInstance.put<ApiResponse<{ plan: SubscriptionPlan }>>(`/subscriptions/plans/${id}`, data);
    return response.data.data.plan;
  },

  /**
   * Delete subscription plan
   */
  deletePlan: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/subscriptions/plans/${id}`);
  },
};

