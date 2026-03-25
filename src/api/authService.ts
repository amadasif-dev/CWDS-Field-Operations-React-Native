import apiClient from './client';
import type { LoginRequest, LoginResponse, ApiResponse } from '../types/api';

export const authService = {
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },
};
