import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

// API configuration
const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_TIMEOUT = 10000;

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh on 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('auth_token', accessToken);
        
        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure (e.g., redirect to login)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to create typed API requests
export function createApiRequest<T>(config: AxiosRequestConfig) {
  return apiClient.request<T>({
    ...config,
  });
} 