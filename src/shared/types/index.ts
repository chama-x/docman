/**
 * User-related types
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Auth-related types
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Theme related types
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Form related types
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

/**
 * Table related types
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Common component props
 */
export interface WithChildren {
  children: React.ReactNode;
} 