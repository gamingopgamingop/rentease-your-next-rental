import apiClient from './api';

export interface Payment {
  id: string;
  bookingId: string;
  payerId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  receiptUrl: string;
  createdAt: string;
}

export interface ProcessPaymentData {
  bookingId: string;
  paymentMethod?: string;
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paymentService = {
  // Process payment
  processPayment: async (data: ProcessPaymentData): Promise<Payment> => {
    const response = await apiClient.post('/payments/process', data);
    return response.data.data;
  },

  // Get payment receipt
  getPaymentReceipt: async (transactionId: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/receipt/${transactionId}`);
    return response.data.data;
  },

  // Get user's payments
  getMyPayments: async (page: number = 1, limit: number = 10): Promise<PaymentsResponse> => {
    const response = await apiClient.get(`/payments/my-payments?page=${page}&limit=${limit}`);
    return response.data;
  },
};
