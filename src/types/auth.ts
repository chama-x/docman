/**
 * Authentication and user-related type definitions
 */

/**
 * User interface representing a user in the system
 */
export interface User {
  /**
   * Unique identifier for the user
   */
  id: string;
  
  /**
   * User's full name
   */
  name: string;
  
  /**
   * User's email address
   */
  email: string;
  
  /**
   * URL to user's avatar image (optional)
   */
  avatar?: string;
  
  /**
   * User roles for permission management
   */
  roles?: string[];
  
  /**
   * When the user was created
   */
  createdAt?: string;
  
  /**
   * When the user was last updated
   */
  updatedAt?: string;
}

/**
 * Authentication state interface for global auth state management
 */
export interface AuthState {
  /**
   * Currently authenticated user, or null if not authenticated
   */
  user: User | null;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether authentication state is being loaded
   */
  loading: boolean;
  
  /**
   * Error message if authentication failed
   */
  error: string | null;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  /**
   * User's email
   */
  email: string;
  
  /**
   * User's password
   */
  password: string;
  
  /**
   * Whether to remember the user's session
   */
  rememberMe?: boolean;
}

/**
 * Registration data interface
 */
export interface RegistrationData {
  /**
   * User's full name
   */
  name: string;
  
  /**
   * User's email
   */
  email: string;
  
  /**
   * User's password
   */
  password: string;
  
  /**
   * Password confirmation
   */
  passwordConfirmation: string;
}

/**
 * Auth token interface
 */
export interface AuthToken {
  /**
   * JWT token
   */
  token: string;
  
  /**
   * Token expiration time
   */
  expiresAt: number;
} 