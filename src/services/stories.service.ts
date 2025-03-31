import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Story } from './types';

const ENDPOINTS = {
  stories: '/api/stories',
  story: (id: string) => `/api/stories/${id}`,
} as const;

export const queryKeys = {
  stories: ['stories'],
  story: (id: string) => ['story', id],
} as const;

export const storiesService = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Story[]>>(ENDPOINTS.stories);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Story>>(ENDPOINTS.story(id));
    return response.data;
  },

  create: async (data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<Story>>(ENDPOINTS.stories, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Story>) => {
    const response = await apiClient.put<ApiResponse<Story>>(ENDPOINTS.story(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.story(id));
    return response.data;
  },
};

export const useStories = () => {
  return useQuery({
    queryKey: queryKeys.stories,
    queryFn: storiesService.getAll,
  });
};

export const useStory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.story(id),
    queryFn: () => storiesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
    },
  });
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Story> }) =>
      storiesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
      queryClient.invalidateQueries({ queryKey: queryKeys.story(id) });
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storiesService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
      queryClient.invalidateQueries({ queryKey: queryKeys.story(id) });
    },
  });
};