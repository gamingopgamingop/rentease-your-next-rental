import apiClient from './api';

export interface OwnerDashboard {
  totalItems: number;
  recentBookings: any[];
  totalEarnings: number;
  bookingsByStatus: {
    [key: string]: number;
  };
}

export interface RenterDashboard {
  activeBookings: any[];
  completedBookings: any[];
  totalSpent: number;
}

export const dashboardService = {
  // Get owner dashboard
  getOwnerDashboard: async (): Promise<OwnerDashboard> => {
    const response = await apiClient.get('/dashboard/owner');
    return response.data.data;
  },

  // Get renter dashboard
  getRenterDashboard: async (): Promise<RenterDashboard> => {
    const response = await apiClient.get('/dashboard/renter');
    return response.data.data;
  },
};

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationService = {
  // Get notifications
  getNotifications: async (page: number = 1, limit: number = 20): Promise<NotificationsResponse> => {
    const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data.data;
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export interface PricingSuggestion {
  suggestedPrice: number;
  basePrice: number;
  demandMultiplier: number;
  locationMultiplier: number;
  categoryMultiplier: number;
  reasoning: string[];
}

export const pricingService = {
  // Get price suggestion
  getPriceSuggestion: async (category: string, location?: string): Promise<PricingSuggestion> => {
    const params = new URLSearchParams({ category });
    if (location) params.append('location', location);
    
    const response = await apiClient.get(`/pricing/suggest?${params.toString()}`);
    return response.data.data;
  },

  // Get pricing analytics (owner only)
  getPricingAnalytics: async (): Promise<any> => {
    const response = await apiClient.get('/pricing/analytics');
    return response.data.data;
  },
};
