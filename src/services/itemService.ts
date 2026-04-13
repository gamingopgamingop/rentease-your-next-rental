import apiClient from './api';

export interface Item {
  id: string;
  name: string;
  category: string;
  description?: string;
  condition: string;
  pricePerDay: number;
  location?: string;
  imageUrl?: string;
  availableFrom?: string;
  availableTo?: string;
  isAvailable: boolean;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    location?: string;
  };
  reviews?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  name: string;
  category: string;
  description?: string;
  condition?: string;
  pricePerDay: number;
  location?: string;
  imageUrl?: string;
  availableFrom?: string;
  availableTo?: string;
}

export interface ItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const itemService = {
  // Get all items (for home/browse page)
  getAllItems: async (page: number = 1, limit: number = 10): Promise<ItemsResponse> => {
    const response = await apiClient.get(`/items?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get item by ID
  getItemById: async (id: string): Promise<Item> => {
    const response = await apiClient.get(`/items/${id}`);
    return response.data.data;
  },

  // Get owner's items
  getMyItems: async (page: number = 1, limit: number = 10): Promise<ItemsResponse> => {
    const response = await apiClient.get(`/items/my-items?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create item
  createItem: async (data: CreateItemData): Promise<Item> => {
    const response = await apiClient.post('/items', data);
    return response.data.data;
  },

  // Update item
  updateItem: async (id: string, data: Partial<CreateItemData>): Promise<Item> => {
    const response = await apiClient.put(`/items/${id}`, data);
    return response.data.data;
  },

  // Delete item
  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },

  // Search items
  searchItems: async (params: {
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    availableFrom?: string;
    availableTo?: string;
    page?: number;
    limit?: number;
  }): Promise<ItemsResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/search/items?${queryParams.toString()}`);
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (type: string = 'popular', limit: number = 10) => {
    const response = await apiClient.get(`/recommendations/${type}?limit=${limit}`);
    return response.data.data;
  },
};
