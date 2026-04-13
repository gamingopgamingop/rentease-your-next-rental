import apiClient from './api';

export interface Booking {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  item?: {
    id: string;
    name: string;
    imageUrl?: string;
    pricePerDay: number;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  renter?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  itemId: string;
  startDate: string;
  endDate: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const bookingService = {
  // Create booking
  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/bookings', data);
    return response.data.data;
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data.data;
  },

  // Get user's bookings (renter or owner)
  getMyBookings: async (page: number = 1, limit: number = 10): Promise<BookingsResponse> => {
    const response = await apiClient.get(`/bookings/my-bookings?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ): Promise<Booking> => {
    const response = await apiClient.put(`/bookings/${id}/status`, { status });
    return response.data.data;
  },
};
