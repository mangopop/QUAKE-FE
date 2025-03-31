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
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  name: string;
  description?: string;
  tests: Test[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  name: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: number;
  name: string;
  owner: any[];
  notes: string | null;
  categories: any[];
}

export interface CreateTestRequest {
  name: string;
  templateId?: string;
  sections: Section[];
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