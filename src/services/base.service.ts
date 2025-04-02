import { apiClient } from '../lib/api-client';
import type { ApiResponse, PaginatedResponse } from './types';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BaseEndpoints {
  base: string;
  item: (id: string) => string;
  search?: string;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  [key: string]: any;
}

export class BaseService<T, CreateT = T, UpdateT = Partial<T>> {
  constructor(
    private endpoints: BaseEndpoints,
    private queryKey: string
  ) {}

  async getAll(params?: BaseQueryParams) {
    if (params?.q && this.endpoints.search) {
      const response = await apiClient.get<PaginatedResponse<T[]>>(this.endpoints.search, { params });
      return response.data;
    }
    const response = await apiClient.get<PaginatedResponse<T[]>>(this.endpoints.base, { params });
    return response.data;
  }

  async getById(id: string | number) {
    const response = await apiClient.get<T>(this.endpoints.item(String(id)));
    return response.data;
  }

  async create(data: CreateT) {
    const response = await apiClient.post<T>(this.endpoints.base, data);
    return response.data;
  }

  async update(id: string | number, data: UpdateT) {
    const response = await apiClient.put<T>(this.endpoints.item(String(id)), data);
    return response.data;
  }

  async delete(id: string | number) {
    const response = await apiClient.delete<void>(this.endpoints.item(String(id)));
    return response.data;
  }

  getQueryKey(params?: BaseQueryParams) {
    return [this.queryKey, params];
  }

  getItemQueryKey(id: string) {
    return [this.queryKey, id];
  }

  // Mutation hooks
  useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: this.create.bind(this),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [this.queryKey], exact: false });
      },
    });
  }

  useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: UpdateT }) => this.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [this.queryKey], exact: false });
        queryClient.invalidateQueries({ queryKey: this.getItemQueryKey(String(id)) });
      },
    });
  }

  useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => this.delete(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: [this.queryKey], exact: false });
        queryClient.invalidateQueries({ queryKey: this.getItemQueryKey(String(id)) });
      },
    });
  }
}