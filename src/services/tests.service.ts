import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Test, CreateTestRequest } from './types';

const ENDPOINTS = {
  tests: '/api/tests',
  test: (id: string) => `/api/tests/${id}`,
} as const;

export const queryKeys = {
  tests: ['tests'],
  test: (id: string) => ['test', id],
} as const;

export const testsService = {
  getAll: async () => {
    const response = await apiClient.get<Test[]>(ENDPOINTS.tests);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Test>(ENDPOINTS.test(id));
    return response.data;
  },

  create: async (data: CreateTestRequest) => {
    const response = await apiClient.post<Test>(ENDPOINTS.tests, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Test>) => {
    const response = await apiClient.put<Test>(ENDPOINTS.test(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<void>(ENDPOINTS.test(id));
    return response.data;
  },
};

export const useTests = () => {
  return useQuery({
    queryKey: queryKeys.tests,
    queryFn: testsService.getAll,
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: queryKeys.test(id),
    queryFn: () => testsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Test> }) =>
      testsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests });
      queryClient.invalidateQueries({ queryKey: queryKeys.test(id) });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testsService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests });
      queryClient.invalidateQueries({ queryKey: queryKeys.test(id) });
    },
  });
};