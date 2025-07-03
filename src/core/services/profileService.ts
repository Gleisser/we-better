/**
 * Profile Service - API integration for profile management
 * Follows the same patterns as goalsService for consistency
 */

import { supabase } from './supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/users`;

// Profile interfaces matching backend types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string | null;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateEmailRequest {
  new_email: string;
  current_password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProfileApiResponse<T = UserProfile> {
  user?: T;
  message?: string;
  error?: string;
  validation_errors?: ValidationError[];
}

export interface EmailStatusResponse {
  email: string;
  is_verified: boolean;
  verified_at: string | null;
  pending_email: string | null;
}

export interface AvatarUploadResponse {
  user: UserProfile;
  message: string;
  avatar_url: string;
}

// API Error type
export interface ApiError {
  error: string;
  status?: number;
  validation_errors?: ValidationError[];
}

/**
 * Get authentication token from Supabase
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session?.access_token || null;
  } catch (error) {
    console.error('Error accessing session:', error);
    return null;
  }
};

/**
 * Handle API requests with proper authentication and error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?:
    | UpdateProfileRequest
    | ChangePasswordRequest
    | UpdateEmailRequest
    | FormData
    | Record<string, unknown>
): Promise<T | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON requests, let browser set it for FormData
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body) {
      if (body instanceof FormData) {
        config.body = body;
      } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        config.body = JSON.stringify(body);
      }
    }

    // Implement exponential backoff for retries
    const MAX_RETRIES = 3;
    let retries = 0;
    let response: Response;

    while (true) {
      try {
        response = await fetch(endpoint, config);
        break;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        // Exponential backoff: 1s, 2s, 4s, etc.
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
      }
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Trigger auth refresh or redirect to login
        throw new Error('Authentication expired');
      }

      // Try to get error message from response
      try {
        const errorData = await response.json();
        const apiError: ApiError = {
          error: errorData.error || `API request failed: ${response.statusText}`,
          status: response.status,
          validation_errors: errorData.validation_errors,
        };
        throw apiError;
      } catch {
        throw new Error(`API request failed: ${response.statusText}`);
      }
    }

    // For DELETE operations that don't return content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true } as unknown as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * PROFILE API FUNCTIONS
 */

// Fetch current user profile
export const fetchUserProfile = async (): Promise<ProfileApiResponse<UserProfile> | null> => {
  try {
    return await apiRequest<ProfileApiResponse<UserProfile>>(API_URL);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile (basic info)
export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<ProfileApiResponse<UserProfile> | null> => {
  try {
    return await apiRequest<ProfileApiResponse<UserProfile>>(API_URL, 'PUT', data);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error; // Re-throw for component error handling
  }
};

// Change password
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ProfileApiResponse | null> => {
  try {
    return await apiRequest<ProfileApiResponse>(`${API_URL}/password`, 'PUT', data);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error; // Re-throw for component error handling
  }
};

// Update email
export const updateEmail = async (
  data: UpdateEmailRequest
): Promise<ProfileApiResponse<UserProfile> | null> => {
  try {
    return await apiRequest<ProfileApiResponse<UserProfile>>(`${API_URL}/email`, 'PUT', data);
  } catch (error) {
    console.error('Error updating email:', error);
    throw error; // Re-throw for component error handling
  }
};

// Get email status
export const getEmailStatus = async (): Promise<EmailStatusResponse | null> => {
  try {
    return await apiRequest<EmailStatusResponse>(`${API_URL}/email`);
  } catch (error) {
    console.error('Error getting email status:', error);
    return null;
  }
};

// Resend email verification
export const resendEmailVerification = async (): Promise<ProfileApiResponse | null> => {
  try {
    return await apiRequest<ProfileApiResponse>(`${API_URL}/email`, 'POST');
  } catch (error) {
    console.error('Error resending email verification:', error);
    throw error; // Re-throw for component error handling
  }
};

// Upload avatar
export const uploadAvatar = async (file: File): Promise<AvatarUploadResponse | null> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    return await apiRequest<AvatarUploadResponse>(`${API_URL}/avatar`, 'POST', formData);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error; // Re-throw for component error handling
  }
};

// Delete avatar
export const deleteAvatar = async (): Promise<ProfileApiResponse<UserProfile> | null> => {
  try {
    return await apiRequest<ProfileApiResponse<UserProfile>>(`${API_URL}/avatar`, 'DELETE');
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error; // Re-throw for component error handling
  }
};

/**
 * UTILITY FUNCTIONS
 */

// Validate file for avatar upload
export const validateAvatarFile = (file: File): ValidationError | null => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > MAX_FILE_SIZE) {
    return {
      field: 'avatar',
      message: 'File size must be less than 5MB',
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      field: 'avatar',
      message: 'Only JPEG, PNG, GIF, and WebP images are allowed',
    };
  }

  return null;
};

// Validate password strength
export const validatePassword = (password: string): ValidationError | null => {
  if (!password || password.length === 0) {
    return { field: 'new_password', message: 'Password is required' };
  }

  if (password.length < 6) {
    return { field: 'new_password', message: 'Password must be at least 6 characters long' };
  }

  if (password.length > 128) {
    return { field: 'new_password', message: 'Password must be less than 128 characters' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      field: 'new_password',
      message: 'Password must contain at least one letter and one number',
    };
  }

  return null;
};

// Validate email format
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  if (email.trim().length > 254) {
    return { field: 'email', message: 'Email address is too long' };
  }

  return null;
};
