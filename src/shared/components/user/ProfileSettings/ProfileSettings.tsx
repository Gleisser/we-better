import React, { useState, useRef } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { PencilIcon, CheckmarkIcon, CloseIcon, EyeOffIcon } from '@/shared/components/common/icons';
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
  const { user } = useAuth();
  const { t } = useCommonTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.full_name || '',
    email: user?.email || '',
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

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle profile picture upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(t('settings.profile.invalidFileType'));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('settings.profile.fileSizeExceeded'));
        return;
      }

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
    try {
      // Validate password fields if changing password
      if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          alert(t('settings.profile.currentPasswordRequired'));
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          alert(t('settings.profile.passwordsDoNotMatch'));
          return;
        }
        if (formData.newPassword.length < 6) {
          alert(t('settings.profile.newPasswordTooShort'));
          return;
        }
      }

      // TODO: Implement actual API calls here
      console.info('Saving profile data:', formData);
      console.info('Profile image:', previewImage);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsEditing(false);
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(t('settings.profile.failedToSave'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = (): void => {
    setFormData({
      fullName: user?.full_name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  return (
    <div className={`${styles.profileSettings} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('settings.profile.title')}</h3>
        {!isEditing ? (
          <button className={styles.editButton} onClick={() => setIsEditing(true)}>
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
              {previewImage || user?.user_metadata?.avatar_url ? (
                <img
                  src={previewImage || (user?.user_metadata?.avatar_url as string)}
                  alt={t('settings.profile.profilePicture') as string}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              {isEditing && (
                <div className={styles.avatarOverlay}>
                  <button
                    className={styles.cameraButton}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CameraIcon className={styles.cameraIcon} />
                  </button>
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
