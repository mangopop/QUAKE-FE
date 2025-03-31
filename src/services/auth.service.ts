import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, LoginCredentials, RegisterCredentials, AuthResponse } from './types';

const ENDPOINTS = {
  login: '/api/login',
  register: '/api/register',
} as const;

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.login, credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.register, credentials);
    return response.data;
  },
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
    },
  });
};