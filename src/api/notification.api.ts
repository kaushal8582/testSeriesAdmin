import axiosInstance from './axios';
import { ApiResponse } from '@/types';

export interface Notification {
  _id: string;
  title: string;
  body: string;
  image?: string;
  data?: Record<string, any>;
  recipientType: 'all' | 'specific' | 'plan' | 'category' | 'exam';
  recipients: {
    userIds?: string[];
    planType?: string;
    categoryIds?: string[];
    examIds?: string[];
  };
  scheduledFor?: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  deliveryStats: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalOpened: number;
    totalClicked: number;
  };
  sentAt?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  title: string;
  body: string;
  image?: string;
  data?: Record<string, any>;
  recipientType: 'all' | 'specific' | 'plan' | 'category' | 'exam';
  recipients: {
    userIds?: string[];
    planType?: string;
    categoryIds?: string[];
    examIds?: string[];
  };
  scheduledFor?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
}

/**
 * Notification API object
 */
export const notificationApi = {
  /**
   * Get all notifications
   */
  getNotifications: async (filters?: {
    status?: string;
    recipientType?: string;
  }): Promise<Notification[]> => {
    const response = await axiosInstance.get<ApiResponse<{ notifications: Notification[] }>>('/notifications', {
      params: filters,
    });
    return response.data.data.notifications;
  },

  /**
   * Get notification by ID
   */
  getNotificationById: async (id: string): Promise<Notification> => {
    const response = await axiosInstance.get<ApiResponse<{ notification: Notification }>>(`/notifications/${id}`);
    return response.data.data.notification;
  },

  /**
   * Create notification
   */
  createNotification: async (data: CreateNotificationData): Promise<Notification> => {
    const response = await axiosInstance.post<ApiResponse<{ notification: Notification }>>('/notifications', data);
    return response.data.data.notification;
  },

  /**
   * Update notification
   */
  updateNotification: async (id: string, data: UpdateNotificationData): Promise<Notification> => {
    const response = await axiosInstance.put<ApiResponse<{ notification: Notification }>>(`/notifications/${id}`, data);
    return response.data.data.notification;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${id}`);
  },

  /**
   * Send notification immediately
   */
  sendNotification: async (id: string): Promise<{
    sent: number;
    failed: number;
    total: number;
  }> => {
    const response = await axiosInstance.post<ApiResponse<{
      sent: number;
      failed: number;
      total: number;
    }>>(`/notifications/${id}/send`);
    return response.data.data;
  },
};

