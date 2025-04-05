import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Category } from './types';

const ENDPOINTS = {
  categories: '/api/categories',
  category: (id: string) => `/api/categories/${id}`,
} as const;

export const queryKeys = {
  categories: ['categories'],
  category: (id: string) => ['category', id],
} as const;

export const categoriesService = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Category[]>>(ENDPOINTS.categories);
    console.log('Categories API response:', response);
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Category>>(ENDPOINTS.category(id));
    return response.data;
  },

  create: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<Category>>(ENDPOINTS.categories, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>) => {
    const response = await apiClient.put<ApiResponse<Category>>(ENDPOINTS.category(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.category(id));
    return response.data;
  },
};

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesService.getAll,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.category(id) });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.category(id) });
    },
  });
};