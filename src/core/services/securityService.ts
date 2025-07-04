/**
 * Security Service - API integration for security settings management
 * Handles 2FA, backup codes, security scoring, and comprehensive security settings
 */

import { supabase } from './supabaseClient';
import { twoFactorLimiter } from './rate-limiter';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/settings`;

// Security Settings Types
export interface SecuritySettings {
  user_id: string;
  two_factor_enabled: boolean;
  sms_backup_enabled: boolean;
  phone_number?: string;
  phone_verified: boolean;
  totp_secret?: string;
  backup_codes_generated: boolean;
  backup_codes_count: number;
  last_password_change?: string;
  login_attempts_count: number;
  account_locked_until?: string;
  security_questions_enabled: boolean;
  session_timeout_minutes: number;
  require_password_on_sensitive_actions: boolean;
  created_at: string;
  updated_at: string;
}

// 2FA Setup Types
export interface TwoFactorSetupRequest {
  phone_number?: string;
}

export interface TwoFactorSetupResponse {
  message: string;
  setup: {
    qr_code_url: string;
    manual_entry_key: string;
    backup_codes?: string[];
  };
}

export interface TwoFactorVerificationRequest {
  verification_code: string;
  backup_code?: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  phone_backup_enabled: boolean;
  phone_verified: boolean;
  backup_codes_remaining: number;
  last_used?: string;
}

// Backup Codes Types
export interface BackupCodesResponse {
  backup_codes: string[];
  codes_remaining: number;
  generated_at: string;
  message: string;
}

// Security Score Types
export interface SecurityScore {
  overall_score: number; // 0-100
  max_score: number;
  factors: SecurityScoreFactor[];
  recommendations: SecurityRecommendation[];
  last_updated: string;
}

export interface SecurityScoreFactor {
  factor: string;
  score: number;
  max_score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
}

export interface SecurityRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action_url?: string;
}

// Phone Verification Types
export interface PhoneVerificationResponse {
  success: boolean;
  message: string;
  verification_code_sent: boolean;
}

// API Response types
export interface SecuritySettingsResponse {
  settings: SecuritySettings;
}

// Session validation constants
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// Track the last activity timestamp
let lastActivityTime = Date.now();

// Update last activity time
const updateLastActivity = (): void => {
  lastActivityTime = Date.now();
};

// Check if session is valid
const isSessionValid = (): boolean => {
  const now = Date.now();
  return now - lastActivityTime < SESSION_TIMEOUT;
};

// Check if session needs refresh
const shouldRefreshSession = (): boolean => {
  const now = Date.now();
  const timeUntilExpiry = SESSION_TIMEOUT - (now - lastActivityTime);
  return timeUntilExpiry < SESSION_REFRESH_THRESHOLD;
};

/**
 * Get the auth token from Supabase session or storage
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Check session validity
    if (!isSessionValid()) {
      throw new Error('Session expired');
    }

    // Check if we need to refresh the session
    if (shouldRefreshSession()) {
      await supabase.auth.refreshSession();
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      updateLastActivity(); // Update last activity time on successful token fetch
      return data.session.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Handle API requests with proper authentication and error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
): Promise<T | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token':
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(body);
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
        throw new Error(errorData.error || `API request failed: ${response.statusText}`);
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
 * SECURITY SETTINGS API FUNCTIONS
 */

// Fetch security settings for the user
export const fetchSecuritySettings = async (): Promise<SecuritySettings | null> => {
  try {
    const response = await apiRequest<SecuritySettingsResponse>(`${API_URL}/security`);
    return response?.settings || null;
  } catch (error) {
    console.error('Error getting security settings:', error);
    return null;
  }
};

// Update security settings
export const updateSecuritySettings = async (
  updates: Partial<SecuritySettings>
): Promise<SecuritySettings | null> => {
  try {
    const response = await apiRequest<SecuritySettingsResponse>(
      `${API_URL}/security`,
      'PUT',
      updates
    );
    return response?.settings || null;
  } catch (error) {
    console.error('Error updating security settings:', error);
    return null;
  }
};

// Partially update security settings
export const patchSecuritySettings = async (
  updates: Partial<SecuritySettings>
): Promise<SecuritySettings | null> => {
  try {
    const response = await apiRequest<SecuritySettingsResponse>(
      `${API_URL}/security`,
      'PATCH',
      updates
    );
    return response?.settings || null;
  } catch (error) {
    console.error('Error patching security settings:', error);
    return null;
  }
};

/**
 * TWO-FACTOR AUTHENTICATION API FUNCTIONS
 */

// Setup 2FA - Generate QR code and secret
export const setup2FA = async (
  request?: TwoFactorSetupRequest
): Promise<TwoFactorSetupResponse | null> => {
  try {
    return await apiRequest<TwoFactorSetupResponse>(
      `${API_URL}/security/2fa`,
      'POST',
      request as unknown as Record<string, unknown>
    );
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return null;
  }
};

// Verify and enable 2FA with rate limiting
export const verify2FA = async (
  request: TwoFactorVerificationRequest
): Promise<TwoFactorSetupResponse | null> => {
  try {
    // Check rate limiting
    if (!(await twoFactorLimiter.checkLimit())) {
      const timeUntilReset = twoFactorLimiter.getTimeUntilReset();
      throw new Error(
        twoFactorLimiter.isLocked()
          ? `Too many attempts. Please try again in ${Math.ceil(timeUntilReset / 60000)} minutes.`
          : `Rate limit exceeded. ${twoFactorLimiter.getRemainingAttempts()} attempts remaining.`
      );
    }

    // Validate code format before making API call
    if (!isValidTOTPCode(request.verification_code)) {
      throw new Error('Invalid verification code format');
    }

    const response = await apiRequest<TwoFactorSetupResponse>(
      `${API_URL}/security/2fa`,
      'PUT',
      request as unknown as Record<string, unknown>
    );

    // Reset rate limiter on successful verification
    if (response?.setup) {
      twoFactorLimiter.reset();
    }

    return response;
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    throw error; // Re-throw to handle in component
  }
};

// Disable 2FA
export const disable2FA = async (
  verificationCode: string
): Promise<{ success: boolean; message: string } | null> => {
  try {
    return await apiRequest<{ success: boolean; message: string }>(
      `${API_URL}/security/2fa?verification_code=${verificationCode}`,
      'DELETE'
    );
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return null;
  }
};

// Get 2FA status
export const get2FAStatus = async (): Promise<TwoFactorStatusResponse | null> => {
  try {
    return await apiRequest<TwoFactorStatusResponse>(`${API_URL}/security/2fa`);
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return null;
  }
};

/**
 * BACKUP CODES API FUNCTIONS
 */

// Get existing backup codes (masked for security)
export const getBackupCodes = async (): Promise<BackupCodesResponse | null> => {
  try {
    return await apiRequest<BackupCodesResponse>(`${API_URL}/security/backup-codes`);
  } catch (error) {
    console.error('Error getting backup codes:', error);
    return null;
  }
};

// Generate new backup codes
export const generateBackupCodes = async (): Promise<BackupCodesResponse | null> => {
  try {
    return await apiRequest<BackupCodesResponse>(`${API_URL}/security/backup-codes`, 'POST');
  } catch (error) {
    console.error('Error generating backup codes:', error);
    return null;
  }
};

/**
 * SECURITY SCORE API FUNCTIONS
 */

// Get security score and recommendations
export const getSecurityScore = async (): Promise<SecurityScore | null> => {
  try {
    return await apiRequest<SecurityScore>(`${API_URL}/security/score`);
  } catch (error) {
    console.error('Error getting security score:', error);
    return null;
  }
};

/**
 * PHONE VERIFICATION API FUNCTIONS
 */

// Send phone verification code
export const sendPhoneVerification = async (
  phoneNumber: string
): Promise<PhoneVerificationResponse | null> => {
  try {
    return await apiRequest<PhoneVerificationResponse>(`${API_URL}/security/phone/verify`, 'POST', {
      phone_number: phoneNumber,
    });
  } catch (error) {
    console.error('Error sending phone verification:', error);
    return null;
  }
};

// Confirm phone verification code
export const confirmPhoneVerification = async (
  phoneNumber: string,
  verificationCode: string
): Promise<{ success: boolean; message: string } | null> => {
  try {
    return await apiRequest<{ success: boolean; message: string }>(
      `${API_URL}/security/phone/confirm`,
      'POST',
      { phone_number: phoneNumber, verification_code: verificationCode }
    );
  } catch (error) {
    console.error('Error confirming phone verification:', error);
    return null;
  }
};

/**
 * UTILITY FUNCTIONS
 */

// Enable 2FA with phone backup
export const enable2FAWithPhoneBackup = async (
  phoneNumber: string,
  verificationCode: string
): Promise<TwoFactorSetupResponse | null> => {
  try {
    // First setup 2FA with phone number
    const setupResponse = await setup2FA({ phone_number: phoneNumber });
    if (!setupResponse?.setup) {
      throw new Error(setupResponse?.message || 'Failed to setup 2FA');
    }

    // Then verify and enable it
    return await verify2FA({ verification_code: verificationCode });
  } catch (error) {
    console.error('Error enabling 2FA with phone backup:', error);
    return null;
  }
};

// Toggle session timeout setting
export const updateSessionTimeout = async (
  timeoutMinutes: number
): Promise<SecuritySettings | null> => {
  return patchSecuritySettings({ session_timeout_minutes: timeoutMinutes });
};

// Toggle require password on sensitive actions
export const toggleSensitiveActionPassword = async (
  requirePassword: boolean
): Promise<SecuritySettings | null> => {
  return patchSecuritySettings({ require_password_on_sensitive_actions: requirePassword });
};

// Check if account is locked
export const isAccountLocked = (settings: SecuritySettings): boolean => {
  if (!settings.account_locked_until) return false;
  return new Date(settings.account_locked_until) > new Date();
};

// Get time until account unlock
export const getAccountUnlockTime = (settings: SecuritySettings): Date | null => {
  if (!settings.account_locked_until) return null;
  const unlockTime = new Date(settings.account_locked_until);
  return unlockTime > new Date() ? unlockTime : null;
};

// Calculate password age in days
export const getPasswordAge = (settings: SecuritySettings): number => {
  if (!settings.last_password_change) return Infinity;
  const passwordDate = new Date(settings.last_password_change);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - passwordDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if password needs changing (older than 90 days)
export const shouldChangePassword = (settings: SecuritySettings): boolean => {
  const passwordAge = getPasswordAge(settings);
  return passwordAge > 90;
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');

  // Handle US phone numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Handle international or other formats
  return phoneNumber;
};

// Mask phone number for display (show only last 4 digits)
export const maskPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `***-***-${digits.slice(-4)}`;
  }
  return '***-***-****';
};

// Get security score color based on score
export const getSecurityScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

// Get security score status text
export const getSecurityScoreStatus = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

// Validate phone number format
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for US phone numbers
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phoneNumber);
};

// Validate TOTP code format
export const isValidTOTPCode = (code: string): boolean => {
  // TOTP codes are typically 6 digits
  const totpRegex = /^\d{6}$/;
  return totpRegex.test(code);
};

// Validate backup code format
export const isValidBackupCode = (code: string): boolean => {
  // Backup codes are typically 8 characters alphanumeric
  const backupCodeRegex = /^[A-Z0-9]{8}$/;
  return backupCodeRegex.test(code.toUpperCase());
};

/**
 * SECURITY RECOMMENDATIONS HELPERS
 */

// Get actionable security recommendations based on current settings
export const getSecurityRecommendations = (
  settings: SecuritySettings,
  score: SecurityScore
): SecurityRecommendation[] => {
  const recommendations: SecurityRecommendation[] = [];

  // Add recommendations based on current settings
  if (!settings.two_factor_enabled) {
    recommendations.push({
      priority: 'high',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account with 2FA.',
      action_url: '/settings?tab=security&action=setup-2fa',
    });
  }

  if (!settings.sms_backup_enabled && settings.two_factor_enabled) {
    recommendations.push({
      priority: 'medium',
      title: 'Add SMS Backup',
      description: 'Add a phone number as backup for your 2FA codes.',
      action_url: '/settings?tab=security&action=add-phone',
    });
  }

  if (shouldChangePassword(settings)) {
    recommendations.push({
      priority: 'high',
      title: 'Update Your Password',
      description: 'Your password is older than 90 days. Consider updating it.',
      action_url: '/settings?tab=security&action=change-password',
    });
  }

  if (!settings.backup_codes_generated && settings.two_factor_enabled) {
    recommendations.push({
      priority: 'medium',
      title: 'Generate Backup Codes',
      description: 'Create backup codes in case you lose access to your 2FA device.',
      action_url: '/settings?tab=security&action=backup-codes',
    });
  }

  // Include recommendations from security score
  if (score.recommendations) {
    recommendations.push(...score.recommendations);
  }

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Add security event types
export type SecurityEventType =
  | 'suspicious_activity'
  | 'login_attempt'
  | 'password_change'
  | 'mfa_change'
  | 'device_change';

// Internal event types that we'll map to the API's accepted types
export type InternalEventType =
  | SecurityEventType
  | '2fa_setup_started'
  | '2fa_setup_completed'
  | '2fa_disabled'
  | '2fa_setup_cancelled';

export interface SecurityEvent {
  id: string;
  user_id: string;
  session_id: string;
  event_type: SecurityEventType;
  reason?: string;
  created_at: string;
}

export interface SecurityEventResponse {
  message: string;
  event: SecurityEvent;
}

// Map internal event types to API event types
const mapToApiEventType = (eventType: InternalEventType): SecurityEventType => {
  switch (eventType) {
    case '2fa_setup_started':
    case '2fa_setup_completed':
    case '2fa_disabled':
      return 'mfa_change';
    default:
      return eventType;
  }
};

// Add security event logging
export const logSecurityEvent = async (
  eventType: InternalEventType,
  sessionId: string | { timestamp: string },
  reason?: string
): Promise<SecurityEventResponse | null> => {
  try {
    // Map the event type to an accepted API event type
    const apiEventType = mapToApiEventType(eventType);

    // Ensure sessionId is a string
    const actualSessionId = typeof sessionId === 'string' ? sessionId : crypto.randomUUID();

    // Add context about the original event type in the reason if it was mapped
    const fullReason =
      eventType !== apiEventType ? `${eventType}${reason ? ': ' + reason : ''}` : reason;

    return await apiRequest<SecurityEventResponse>(`${API_URL}/security/events`, 'POST', {
      event_type: apiEventType,
      session_id: actualSessionId,
      reason: fullReason,
    });
  } catch (error) {
    console.error('Error logging security event:', error);
    return null;
  }
};
