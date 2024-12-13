import axios from 'axios';
import { API_CONFIG } from './api-config';

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_CONFIG.token}`,
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error or handle it according to your needs
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
); 