import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { PencilIcon, CheckmarkIcon, CloseIcon, EyeOffIcon } from '@/shared/components/common/icons';
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  validateAvatarFile,
  validatePassword,
  validateEmail,
  type UserProfile,
  type ValidationError,
  type ApiError,
} from '@/core/services/profileService';
import styles from './ProfileSettings.module.css';

interface ProfileSettingsProps {
  className?: string;
}

interface ProfileFormData {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationState {
  type: 'success' | 'error' | null;
  message: string;
  validationErrors?: ValidationError[];
}

// Create custom icons for Camera and Eye
const CameraIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ProfileSettings = ({ className }: ProfileSettingsProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    type: null,
    message: '',
    validationErrors: [],
  });

  // Load profile data
  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetchUserProfile();
      if (response?.user) {
        const userProfile = response.user;
        setProfile(userProfile);
        setFormData(prev => ({
          ...prev,
          fullName: userProfile.full_name || '',
          email: userProfile.email || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load profile data',
        validationErrors: [],
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Load profile on component mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Show notification helper
  const showNotification = useCallback(
    (type: 'success' | 'error', message: string, validationErrors: ValidationError[] = []) => {
      setNotification({ type, message, validationErrors });
      // Auto-hide success notifications after 3 seconds
      if (type === 'success') {
        setTimeout(() => {
          setNotification({ type: null, message: '', validationErrors: [] });
        }, 3000);
      }
    },
    []
  );

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle profile picture upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using the profileService validator
      const validationError = validateAvatarFile(file);
      if (validationError) {
        showNotification('error', validationError.message);
        return;
      }

      // Store the file for later upload
      setUploadedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save
  const handleSave = async (): Promise<void> => {
    setIsLoading(true);
    setNotification({ type: null, message: '', validationErrors: [] });

    try {
      let hasUpdates = false;
      const validationErrors: ValidationError[] = [];

      // Validate and update basic profile info
      const profileUpdateData: { full_name?: string; email?: string } = {};

      if (formData.fullName !== (profile?.full_name || '')) {
        if (!formData.fullName.trim()) {
          validationErrors.push({ field: 'fullName', message: 'Full name is required' });
        } else if (formData.fullName.trim().length < 2) {
          validationErrors.push({
            field: 'fullName',
            message: 'Full name must be at least 2 characters',
          });
        } else {
          profileUpdateData.full_name = formData.fullName.trim();
          hasUpdates = true;
        }
      }

      if (formData.email !== (profile?.email || '')) {
        const emailError = validateEmail(formData.email);
        if (emailError) {
          validationErrors.push(emailError);
        } else {
          profileUpdateData.email = formData.email.trim();
          hasUpdates = true;
        }
      }

      // Validate password change if requested
      const isChangingPassword =
        formData.newPassword || formData.confirmPassword || formData.currentPassword;
      if (isChangingPassword) {
        if (!formData.currentPassword) {
          validationErrors.push({
            field: 'currentPassword',
            message: 'Current password is required',
          });
        }
        if (!formData.newPassword) {
          validationErrors.push({ field: 'newPassword', message: 'New password is required' });
        } else {
          const passwordError = validatePassword(formData.newPassword);
          if (passwordError) {
            validationErrors.push(passwordError);
          }
        }
        if (formData.newPassword !== formData.confirmPassword) {
          validationErrors.push({
            field: 'confirmPassword',
            message: 'Password confirmation does not match',
          });
        }
        if (
          formData.currentPassword &&
          formData.newPassword &&
          formData.currentPassword === formData.newPassword
        ) {
          validationErrors.push({
            field: 'newPassword',
            message: 'New password must be different from current password',
          });
        }
      }

      // Show validation errors if any
      if (validationErrors.length > 0) {
        showNotification('error', 'Please fix the validation errors', validationErrors);
        return;
      }

      // Upload avatar if changed
      if (uploadedFile) {
        try {
          const avatarResponse = await uploadAvatar(uploadedFile);
          if (avatarResponse?.user) {
            setProfile(avatarResponse.user);
            showNotification('success', 'Profile picture updated successfully');
          }
        } catch (error) {
          const apiError = error as ApiError;
          showNotification('error', apiError.error, apiError.validation_errors);
          return;
        }
      }

      // Update basic profile info
      if (hasUpdates) {
        try {
          const profileResponse = await updateUserProfile(profileUpdateData);
          if (profileResponse?.user) {
            setProfile(profileResponse.user);
            showNotification('success', 'Profile updated successfully');
          }
        } catch (error) {
          const apiError = error as ApiError;
          showNotification('error', apiError.error, apiError.validation_errors);
          return;
        }
      }

      // Change password if requested
      if (isChangingPassword) {
        try {
          await changePassword({
            current_password: formData.currentPassword,
            new_password: formData.newPassword,
            confirm_password: formData.confirmPassword,
          });
          showNotification('success', 'Password changed successfully');
        } catch (error) {
          const apiError = error as ApiError;
          showNotification('error', apiError.error, apiError.validation_errors);
          return;
        }
      }

      // Success - reset form
      setIsEditing(false);
      setPreviewImage(null);
      setUploadedFile(null);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      if (!hasUpdates && !isChangingPassword && !uploadedFile) {
        showNotification('success', 'No changes to save');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      showNotification('error', 'Failed to save profile changes');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = (): void => {
    setFormData({
      fullName: profile?.full_name || '',
      email: profile?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPreviewImage(null);
    setUploadedFile(null);
    setNotification({ type: null, message: '', validationErrors: [] });
    setIsEditing(false);
  };

  return (
    <div className={`${styles.profileSettings} ${className || ''}`}>
      {/* Notification */}
      {notification.type && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <p className={styles.notificationMessage}>{notification.message}</p>
          {notification.validationErrors && notification.validationErrors.length > 0 && (
            <ul className={styles.validationErrors}>
              {notification.validationErrors.map((error, index) => (
                <li key={index} className={styles.validationError}>
                  {error.message}
                </li>
              ))}
            </ul>
          )}
          <button
            className={styles.notificationClose}
            onClick={() => setNotification({ type: null, message: '', validationErrors: [] })}
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingProfile && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading profile...</p>
        </div>
      )}

      <div className={styles.header}>
        <h3 className={styles.title}>{t('settings.profile.title')}</h3>
        {!isEditing ? (
          <button
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
            disabled={isLoadingProfile}
          >
            <PencilIcon className={styles.editIcon} />
            {t('settings.profile.editProfile')}
          </button>
        ) : (
          <div className={styles.actionButtons}>
            <button className={styles.cancelButton} onClick={handleCancel} disabled={isLoading}>
              <CloseIcon className={styles.buttonIcon} />
              {t('settings.profile.cancel')}
            </button>
            <button className={styles.saveButton} onClick={handleSave} disabled={isLoading}>
              <CheckmarkIcon className={styles.buttonIcon} />
              {isLoading ? t('settings.profile.saving') : t('settings.profile.saveChanges')}
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Profile Picture Section */}
        <div className={styles.profilePictureSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {previewImage || profile?.avatar_url ? (
                <img
                  src={previewImage || profile?.avatar_url || ''}
                  alt={t('settings.profile.profilePicture') as string}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {profile?.full_name?.[0]?.toUpperCase() ||
                    profile?.email?.[0]?.toUpperCase() ||
                    'U'}
                </div>
              )}
              {isEditing && (
                <div className={styles.avatarOverlay}>
                  <button
                    className={styles.cameraButton}
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload new profile picture"
                  >
                    <CameraIcon className={styles.cameraIcon} />
                  </button>
                  {(previewImage || profile?.avatar_url) && (
                    <button
                      className={styles.deleteButton}
                      onClick={async () => {
                        try {
                          const response = await deleteAvatar();
                          if (response?.user) {
                            setProfile(response.user);
                            setPreviewImage(null);
                            setUploadedFile(null);
                            showNotification('success', 'Profile picture removed successfully');
                          }
                        } catch (error) {
                          const apiError = error as ApiError;
                          showNotification('error', apiError.error, apiError.validation_errors);
                        }
                      }}
                      title="Remove profile picture"
                    >
                      <CloseIcon className={styles.deleteIcon} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
            disabled={!isEditing}
          />

          <div className={styles.avatarInfo}>
            <p className={styles.avatarTitle}>{t('settings.profile.profilePicture')}</p>
            <p className={styles.avatarDescription}>
              {isEditing
                ? t('settings.profile.uploadDescription')
                : t('settings.profile.profileDescription')}
            </p>
          </div>
        </div>

        {/* Profile Information Fields */}
        <div className={styles.fieldsSection}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t('settings.profile.fullName')}</label>
            <input
              type="text"
              className={styles.fieldInput}
              value={formData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              placeholder={t('settings.profile.fullNamePlaceholder') as string}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t('settings.profile.emailAddress')}</label>
            <input
              type="email"
              className={styles.fieldInput}
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder={t('settings.profile.emailPlaceholder') as string}
              disabled={!isEditing}
            />
          </div>

          {/* Password Change Section - Always visible when editing */}
          {isEditing && (
            <div className={styles.passwordSection}>
              <div className={styles.passwordHeader}>
                <h4 className={styles.passwordTitle}>{t('settings.profile.changePassword')}</h4>
                <span className={styles.optional}>{t('settings.profile.optional')}</span>
              </div>

              <div className={styles.passwordFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {t('settings.profile.currentPassword')}
                  </label>
                  <div className={styles.passwordInputContainer}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={styles.fieldInput}
                      value={formData.currentPassword}
                      onChange={e => handleInputChange('currentPassword', e.target.value)}
                      placeholder={t('settings.profile.currentPasswordPlaceholder') as string}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggleButton}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOffIcon className={styles.eyeIcon} />
                      ) : (
                        <EyeIcon className={styles.eyeIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('settings.profile.newPassword')}</label>
                  <div className={styles.passwordInputContainer}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className={styles.fieldInput}
                      value={formData.newPassword}
                      onChange={e => handleInputChange('newPassword', e.target.value)}
                      placeholder={t('settings.profile.newPasswordPlaceholder') as string}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggleButton}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOffIcon className={styles.eyeIcon} />
                      ) : (
                        <EyeIcon className={styles.eyeIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {t('settings.profile.confirmNewPassword')}
                  </label>
                  <div className={styles.passwordInputContainer}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={styles.fieldInput}
                      value={formData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      placeholder={t('settings.profile.confirmPasswordPlaceholder') as string}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggleButton}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className={styles.eyeIcon} />
                      ) : (
                        <EyeIcon className={styles.eyeIcon} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
