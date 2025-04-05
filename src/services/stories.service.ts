import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Story, CreateStoryRequest, Test, Template, SectionResultsResponse, SectionResult, SectionNotesResponse, SectionNote } from './types';

const ENDPOINTS = {
  stories: '/api/stories',
  story: (id: string) => `/api/stories/${id}`,
  storyTestResults: (id: string) => `/api/stories/${id}/test-results`,
  storySectionResults: (id: string) => `/api/stories/${id}/section-results`,
  storySectionResult: (storyId: string, sectionId: number) => `/api/stories/${storyId}/section-results/${sectionId}`,
  storySectionNotes: (storyId: string, sectionId: number) => `/api/stories/${storyId}/section-results/${sectionId}/notes`,
  testsByTemplate: (templateId: number) => `/api/tests/by-template/${templateId}`,
  templates: '/api/templates',
} as const;

export const queryKeys = {
  stories: ['stories'],
  story: (id: string) => ['story', id],
  testsByTemplate: (templateId: number) => ['tests', 'template', templateId],
  templates: ['templates'],
} as const;

interface TestResultRequest {
  testId: number;
  passed: boolean;
  notes?: string;
}

export const storiesService = {
  getAll: async () => {
    const response = await apiClient.get<Story[]>(ENDPOINTS.stories);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Story>(ENDPOINTS.story(id));
    return response.data;
  },

  create: async (data: CreateStoryRequest) => {
    const response = await apiClient.post<Story>(ENDPOINTS.stories, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Story>) => {
    const response = await apiClient.put<Story>(ENDPOINTS.story(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<void>(ENDPOINTS.story(id));
    return response.data;
  },

  getTestsByTemplate: async (templateId: number) => {
    const response = await apiClient.get<Test[]>(ENDPOINTS.testsByTemplate(templateId));
    return response.data;
  },

  getTemplates: async () => {
    const response = await apiClient.get<Template[]>(ENDPOINTS.templates);
    return response.data;
  },

  saveTestResult: async (storyId: string, data: TestResultRequest) => {
    const response = await apiClient.post<Story>(ENDPOINTS.storyTestResults(storyId), data);
    return response.data;
  },

  updateTestResult: async (storyId: string, testId: number, data: { status: "not_tested" | "passed" | "failed"; notes?: string | null }) => {
    const response = await apiClient.put(ENDPOINTS.storyTestResults(storyId), {
      testId,
      ...data
    });
    return response.data;
  },

  getSectionResults: async (storyId: string) => {
    const response = await apiClient.get<SectionResultsResponse>(ENDPOINTS.storySectionResults(storyId));
    return response.data;
  },

  updateSectionResult: async (storyId: string, sectionId: number, data: { status: "not_tested" | "passed" | "failed" }) => {
    const response = await apiClient.put<SectionResult>(ENDPOINTS.storySectionResult(storyId, sectionId), data);
    return response.data;
  },

  getSectionNotes: async (storyId: string, sectionId: number) => {
    const response = await apiClient.get<SectionNotesResponse>(ENDPOINTS.storySectionNotes(storyId, sectionId));
    return response.data;
  },

  addSectionNote: async (storyId: string, sectionId: number, data: { note: string }) => {
    const response = await apiClient.post<SectionNote>(ENDPOINTS.storySectionNotes(storyId, sectionId), data);
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

export const useTestsByTemplate = (templateId: number) => {
  return useQuery({
    queryKey: queryKeys.testsByTemplate(templateId),
    queryFn: () => storiesService.getTestsByTemplate(templateId),
    enabled: !!templateId,
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: storiesService.getTemplates,
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

export const useSaveTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, data }: { storyId: string; data: TestResultRequest }) =>
      storiesService.saveTestResult(storyId, data),
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.story(storyId) });
    },
  });
};

export const useUpdateTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, testId, data }: { storyId: string; testId: number; data: { status: "not_tested" | "passed" | "failed"; notes?: string | null } }) =>
      storiesService.updateTestResult(storyId, testId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
      queryClient.invalidateQueries({ queryKey: queryKeys.story(variables.storyId) });
    }
  });
};

export const useSectionResults = (storyId: string) => {
  return useQuery({
    queryKey: ['section-results', storyId],
    queryFn: () => storiesService.getSectionResults(storyId),
    enabled: !!storyId,
  });
};

export const useUpdateSectionResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, sectionId, data }: { storyId: string; sectionId: number; data: { status: "not_tested" | "passed" | "failed" } }) =>
      storiesService.updateSectionResult(storyId, sectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section-results', variables.storyId] });
    }
  });
};

export const useSectionNotes = (storyId: string, sectionId: number) => {
  return useQuery({
    queryKey: ['section-notes', storyId, sectionId],
    queryFn: () => storiesService.getSectionNotes(storyId, sectionId),
    enabled: !!storyId && !!sectionId,
  });
};

export const useAddSectionNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, sectionId, data }: { storyId: string; sectionId: number; data: { note: string } }) =>
      storiesService.addSectionNote(storyId, sectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section-notes', variables.storyId, variables.sectionId] });
      queryClient.invalidateQueries({ queryKey: ['section-results', variables.storyId] });
    }
  });
};