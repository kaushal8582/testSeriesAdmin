import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  subscriptionPlanId: {
    _id: string;
    name: string;
    planType: string;
    durationLabel: string;
    price: number;
  };
  subscriptionId?: string;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus: 'initiated' | 'clicked' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  promoCodeId?: {
    _id: string;
    code: string;
    name: string;
  };
  discountAmount: number;
  finalAmount: number;
  referralCode?: string;
  referralDiscount: number;
  paymentInitiatedAt: string;
  paymentClickedAt?: string | null;
  paymentCompletedAt?: string | null;
  paymentFailedAt?: string | null;
  failureReason?: string | null;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
}

export const paymentApi = {
  /**
   * Get all payments
   */
  getAllPayments: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ payments: Payment[]; pagination: any }> => {
    const response = await axiosInstance.get<ApiResponse<{ payments: Payment[]; pagination: any }>>('/payments', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await axiosInstance.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
    return response.data.data.payment;
  },
};

