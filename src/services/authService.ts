import apiClient from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'OWNER' | 'RENTER';
  phone?: string;
  location?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'RENTER';
  phone?: string;
  location?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, accessToken, refreshToken };
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, accessToken, refreshToken };
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get user profile from API
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/profile');
    const user = response.data.data;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/users/profile', data);
    const user = response.data.data;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
};
