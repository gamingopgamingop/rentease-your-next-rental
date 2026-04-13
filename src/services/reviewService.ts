import apiClient from './api';

export interface Review {
  id: string;
  itemId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  reviewer?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface CreateReviewData {
  itemId: string;
  rating: number;
  comment?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewService = {
  // Create review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data.data;
  },

  // Get item reviews
  getItemReviews: async (itemId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> => {
    const response = await apiClient.get(`/reviews/item/${itemId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update review
  updateReview: async (id: string, data: Partial<CreateReviewData>): Promise<Review> => {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data.data;
  },

  // Delete review
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};
