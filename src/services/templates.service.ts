import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Template } from './types';

const ENDPOINTS = {
  templates: '/api/templates',
  template: (id: string) => `/api/templates/${id}`,
} as const;

export const queryKeys = {
  templates: ['templates'],
  template: (id: string) => ['template', id],
} as const;

export const templatesService = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Template[]>>(ENDPOINTS.templates);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Template>>(ENDPOINTS.template(id));
    return response.data;
  },

  create: async (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<Template>>(ENDPOINTS.templates, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Template>) => {
    const response = await apiClient.put<ApiResponse<Template>>(ENDPOINTS.template(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.template(id));
    return response.data;
  },
};

export const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: templatesService.getAll,
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.template(id),
    queryFn: () => templatesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Template> }) =>
      templatesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
      queryClient.invalidateQueries({ queryKey: queryKeys.template(id) });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
      queryClient.invalidateQueries({ queryKey: queryKeys.template(id) });
    },
  });
};