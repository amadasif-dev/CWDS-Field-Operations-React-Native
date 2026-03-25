import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.cwdsfield.com/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle token refresh & retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Token expired — attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          await AsyncStorage.setItem('auth_token', data.token);
          await AsyncStorage.setItem('refresh_token', data.refreshToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
      }
    }

    // Retry logic for network errors
    if (
      !error.response &&
      originalRequest &&
      (originalRequest._retryCount ?? 0) < MAX_RETRIES
    ) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), RETRY_DELAY * originalRequest._retryCount!),
      );
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
