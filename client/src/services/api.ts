import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is the server running?');
    }
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 401:
          // Clear token and redirect to login if unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden access
          console.error('Access denied');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        default:
          // Handle other errors
          console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server. Check if server is running at:', API_BASE_URL);
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export interface Poll {
  _id: string;
  title: string;
  options: {
    _id: string;
    text: string;
    votes: number;
  }[];
  createdBy: string | { _id: string; email: string; role: string };
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
  isPublic: boolean;
  accessCode?: string;
  voters: any[];
  totalVotes: number;
  resultsDeclared: boolean;
}

export interface CreatePollData {
  title: string;
  options: string[];
  expiryHours: number;
  isPublic: boolean;
}

export interface VoteData {
  optionId: string;
  accessCode?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const pollApi = {
  // Get all active polls
  getPolls: async (): Promise<Poll[]> => {
    try {
      const response = await api.get('/polls');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.message || 'Failed to fetch polls',
          error.response?.status,
          error.response?.data
        );
      }
      throw new ApiError('An unexpected error occurred');
    }
  },

  // Get a single poll
  getPoll: async (id: string, accessCode?: string): Promise<Poll> => {
    const params = accessCode ? { accessCode } : {};
    try {
      const response = await api.get(`/polls/${id}`, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.message || 'Failed to fetch poll',
          error.response?.status,
          error.response?.data
        );
      }
      throw new ApiError('An unexpected error occurred');
    }
  },

  // Create a new poll
  createPoll: async (data: CreatePollData): Promise<Poll> => {
    try {
      const response = await api.post('/polls', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating poll:', error);
      throw new Error(error.response?.data?.message || 'Failed to create poll');
    }
  },

  // Submit a vote
  submitVote: async (pollId: string, data: VoteData): Promise<Poll> => {
    try {
      const response = await api.post(`/polls/${pollId}/vote`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.message || 'Failed to submit vote',
          error.response?.status,
          error.response?.data
        );
      }
      throw new ApiError('An unexpected error occurred');
    }
  },

  // Delete a poll
  deletePoll: async (id: string): Promise<void> => {
    try {
      await api.delete(`/polls/${id}`);
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete poll');
    }
  },

  // Get admin dashboard data
  getDashboardData: async (): Promise<Poll[]> => {
    try {
      const response = await api.get('/polls/admin/dashboard');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      if (error.response?.status === 401) {
        throw new Error('Please log in to view dashboard');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  // Get all public polls
  getPublicPolls: async (): Promise<Poll[]> => {
    try {
      console.log('Attempting to fetch public polls from:', `${API_BASE_URL}/polls/public`);
      const response = await api.get('/polls/public');
      console.log('Public polls response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching public polls:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch polls');
    }
  },

  // Get user's polls
  getUserPolls: async (): Promise<Poll[]> => {
    try {
      const response = await api.get('/polls/user');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user polls:', error);
      if (error.response?.status === 401) {
        throw new Error('Please log in to view your polls');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch polls');
    }
  },

  // Declare poll results
  declareResults: async (id: string): Promise<Poll> => {
    try {
      const response = await api.patch(`/polls/${id}/declare-results`);
      return response.data.poll;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.message || 'Failed to declare results',
          error.response?.status,
          error.response?.data
        );
      }
      throw new ApiError('An unexpected error occurred');
    }
  },
};

export default pollApi;

export const authApi = {
  // Register a new user
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      return response.data;
    } catch (error: any) {
      console.error('Error registering:', error);
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  },

  // Register a new admin (requires existing admin token)
  registerAdmin: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/register-admin', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error registering admin:', error);
      throw new Error(error.response?.data?.message || 'Failed to register admin');
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send reset email');
    }
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  },
};

export const userApi = {
  updateProfile: async (data: { name?: string; phone?: string; profilePic?: string }) => {
    try {
      const response = await api.patch('/auth/me', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },
  resetPassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  },
}; 