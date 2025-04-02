import { useQuery } from '@tanstack/react-query';
import type { Template, CreateTemplateRequest } from './types';
import { BaseService, BaseEndpoints } from './base.service';

const ENDPOINTS: BaseEndpoints = {
  base: '/api/templates',
  item: (id: string) => `/api/templates/${id}`,
};

const templatesService = new BaseService<Template, CreateTemplateRequest>(ENDPOINTS, 'templates');

export const queryKeys = {
  templates: templatesService.getQueryKey(),
  template: (id: string) => templatesService.getItemQueryKey(id),
};

export const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => templatesService.getAll(),
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.template(id),
    queryFn: () => templatesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => templatesService.useCreate();
export const useUpdateTemplate = () => templatesService.useUpdate();
export const useDeleteTemplate = () => templatesService.useDelete();