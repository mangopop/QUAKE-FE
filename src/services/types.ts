// Example types - modify these based on your actual API
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// API Resource Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Story {
  id: number;
  name: string;
  owner: Owner;
  templates: Template[];
  templateIds?: number[];
  testResults: {
    id: number;
    status: "not_tested" | "passed" | "failed";
    notes: string | null;
    test: {
      id: number;
      name: string;
      owner: Owner;
      notes: string | null;
      categories: any[][];
    };
  }[];
}

export interface Section {
  id: number;
  name: string;
  description: string;
  orderIndex: number;
}

export interface Template {
  id: number;
  name: string;
  owner: any[];
  tests: {
    id: number;
    name: string;
    owner: any[];
    notes: string | null;
    sections: Section[];
  }[];
  stories: any[];
}

export interface Test {
  id: number;
  name: string;
  owner: Owner;
  notes: string | null;
  categories: (string | Category)[];
  templateId?: string;
  sections: Section[];
}

export interface PaginatedTestsResponse {
  data: Test[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTestRequest {
  name: string;
  templateId?: string;
  sections: {
    name: string;
    description: string;
    orderIndex: number;
  }[];
  categories: string[];
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
}

export interface CreateTemplateRequest {
  name: string;
  testIds: number[];
  storyIds: number[];
}

export interface CreateStoryRequest {
  name: string;
  templateIds: number[];
}

export interface TestNotes {
  id: number;
  note: string;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface SectionNote {
  id: number;
  note: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface SectionResult {
  id: number;
  section: {
    id: number;
    name: string;
    description: string;
  };
  status: "not_tested" | "passed" | "failed";
  updatedAt: string;
  notes: SectionNote[];
}

export interface SectionResultsResponse {
  section_results: SectionResult[];
}

export interface SectionNotesResponse {
  notes: SectionNote[];
}

export interface TestResult {
  id: number;
  status: "not_tested" | "passed" | "failed";
  notes: TestNotes[];
  sectionResults: SectionResult[];
  test: {
    id: number;
    name: string;
    owner: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
    notes: string | null;
    categories: any[][];
    sections: {
      id: number;
      name: string;
      description: string;
      orderIndex: number;
    }[];
    createdAt: string;
  };
}