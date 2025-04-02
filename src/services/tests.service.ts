import { useQuery } from '@tanstack/react-query';
import type { Test, CreateTestRequest, PaginatedTestsResponse } from './types';
import { BaseService, BaseEndpoints, BaseQueryParams } from './base.service';

const ENDPOINTS: BaseEndpoints = {
  base: '/api/tests',
  item: (id: string) => `/api/tests/${id}`,
  search: '/api/tests/search',
};

const testsService = new BaseService<Test, CreateTestRequest>(ENDPOINTS, 'tests');

interface GetTestsParams extends BaseQueryParams {
  category?: string;
  ownerId?: number;
}

export const queryKeys = {
  tests: (params?: GetTestsParams) => testsService.getQueryKey(params),
  test: (id: string) => testsService.getItemQueryKey(id),
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
    queryFn: () => testsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTest = () => testsService.useCreate();
export const useUpdateTest = () => testsService.useUpdate();
export const useDeleteTest = () => testsService.useDelete();