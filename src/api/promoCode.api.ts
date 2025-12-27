import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface PromoCode {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  maxUsage?: number;
  usedCount: number;
  maxUsagePerUser: number;
  applicablePlans?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodeData {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom: string;
  validUntil: string;
  maxUsage?: number;
  maxUsagePerUser?: number;
  applicablePlans?: string[];
}

export const promoCodeApi = {
  /**
   * Get all promo codes
   */
  getPromoCodes: async (): Promise<PromoCode[]> => {
    const response = await axiosInstance.get<ApiResponse<{ promoCodes: PromoCode[] }>>('/promo-codes');
    return response.data.data.promoCodes || [];
  },

  /**
   * Create promo code
   */
  createPromoCode: async (data: CreatePromoCodeData): Promise<PromoCode> => {
    const response = await axiosInstance.post<ApiResponse<{ promoCode: PromoCode }>>('/promo-codes', data);
    return response.data.data.promoCode;
  },

  /**
   * Update promo code
   */
  updatePromoCode: async (id: string, data: Partial<CreatePromoCodeData>): Promise<PromoCode> => {
    const response = await axiosInstance.put<ApiResponse<{ promoCode: PromoCode }>>(`/promo-codes/${id}`, data);
    return response.data.data.promoCode;
  },

  /**
   * Delete promo code
   */
  deletePromoCode: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/promo-codes/${id}`);
  },
};

