import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, PaginatedResponse } from './types';

// Example interface - modify based on your actual data structure
interface Example {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

// API endpoints
const ENDPOINTS = {
  examples: '/examples',
  example: (id: string) => `/examples/${id}`,
} as const;

// Query keys
export const queryKeys = {
  examples: ['examples'],
  example: (id: string) => ['example', id],
} as const;

// Service functions
export const exampleService = {
  // Fetch all examples
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Example[]>>(ENDPOINTS.examples, {
      params,
    });
    return response.data;
  },

  // Fetch single example
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Example>>(ENDPOINTS.example(id));
    return response.data;
  },

  // Create example
  create: async (data: Omit<Example, 'id' | 'createdAt'>) => {
    const response = await apiClient.post<ApiResponse<Example>>(ENDPOINTS.examples, data);
    return response.data;
  },

  // Update example
  update: async (id: string, data: Partial<Example>) => {
    const response = await apiClient.put<ApiResponse<Example>>(ENDPOINTS.example(id), data);
    return response.data;
  },

  // Delete example
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.example(id));
    return response.data;
  },
};

// React Query hooks
export const useExamples = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...queryKeys.examples, params],
    queryFn: () => exampleService.getAll(params),
  });
};

export const useExample = (id: string) => {
  return useQuery({
    queryKey: queryKeys.example(id),
    queryFn: () => exampleService.getById(id),
    enabled: !!id,
  });
};

export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exampleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examples });
    },
  });
};

export const useUpdateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Example> }) =>
      exampleService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examples });
      queryClient.invalidateQueries({ queryKey: queryKeys.example(id) });
    },
  });
};

export const useDeleteExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exampleService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examples });
      queryClient.invalidateQueries({ queryKey: queryKeys.example(id) });
    },
  });
};