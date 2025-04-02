import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Test, CreateTestRequest, PaginatedTestsResponse } from './types';

const ENDPOINTS = {
  tests: '/api/tests',
  test: (id: string) => `/api/tests/${id}`,
  search: '/api/tests/search',
} as const;

export const queryKeys = {
  tests: (params?: { page?: number; limit?: number; q?: string; category?: string; ownerId?: number }) =>
    ['tests', params],
  test: (id: string) => ['test', id],
} as const;

interface GetTestsParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  ownerId?: number;
}

export const testsService = {
  getAll: async (params?: GetTestsParams) => {
    if (params?.q || params?.category || params?.ownerId) {
      const response = await apiClient.get<PaginatedTestsResponse>(ENDPOINTS.search, { params });
      return response.data;
    }
    const response = await apiClient.get<PaginatedTestsResponse>(ENDPOINTS.tests, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Test>(ENDPOINTS.test(String(id)));
    return response.data;
  },

  create: async (data: CreateTestRequest) => {
    const response = await apiClient.post<Test>(ENDPOINTS.tests, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Test>) => {
    const response = await apiClient.put<Test>(ENDPOINTS.test(String(id)), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<void>(ENDPOINTS.test(String(id)));
    return response.data;
  },
};

export const useTests = (params?: GetTestsParams) => {
  return useQuery({
    queryKey: queryKeys.tests(params),
    queryFn: () => testsService.getAll(params),
    placeholderData: (previousData) => previousData
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: queryKeys.test(id),
    queryFn: () => testsService.getById(Number(id)),
    enabled: !!id,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests() });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Test> }) =>
      testsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.test(String(id)) });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => testsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.test(String(id)) });
    },
  });
};