import { useState } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { SettingsIcon } from '@/shared/components/common/icons';
import ThemeSelector from '@/shared/components/theme/ThemeSelector';
import LanguageSelector from '@/shared/components/i18n/LanguageSelector';
import ProfileSettings from '@/shared/components/user/ProfileSettings';
import Toggle from '@/shared/components/common/Toggle';
import styles from './Settings.module.css';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const Settings = (): JSX.Element => {
  const { t } = useCommonTranslation();

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
  });

  // Handle notification setting changes
  const handleNotificationChange = (
    setting: keyof NotificationSettings,
    enabled: boolean
  ): void => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: enabled,
    }));

    // TODO: Save to backend/localStorage
    console.info(`${setting} set to:`, enabled);
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <SettingsIcon className={styles.titleIcon} />
          <h1 className={styles.title}>{t('navigation.settings')}</h1>
        </div>
        <p className={styles.subtitle}>Manage your preferences and account settings</p>
      </div>

      <div className={styles.content}>
        <ProfileSettings className={styles.profileSettings} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>General</h2>
          <p className={styles.sectionDescription}>
            Basic settings for your account and preferences
          </p>

          <ThemeSelector className={styles.themeSelector} />

          <LanguageSelector className={styles.languageSelector} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <p className={styles.sectionDescription}>Control what notifications you receive</p>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Email Notifications</h3>
              <p className={styles.settingDescription}>Receive updates and alerts via email</p>
            </div>
            <div className={styles.settingControl}>
              <Toggle
                enabled={notificationSettings.emailNotifications}
                onChange={enabled => handleNotificationChange('emailNotifications', enabled)}
                aria-label="Toggle email notifications"
                size="medium"
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Push Notifications</h3>
              <p className={styles.settingDescription}>
                Receive push notifications in your browser for important updates
              </p>
            </div>
            <div className={styles.settingControl}>
              <Toggle
                enabled={notificationSettings.pushNotifications}
                onChange={enabled => handleNotificationChange('pushNotifications', enabled)}
                aria-label="Toggle push notifications"
                size="medium"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy & Security</h2>
          <p className={styles.sectionDescription}>
            Manage your privacy settings and account security
          </p>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Data Privacy</h3>
              <p className={styles.settingDescription}>Control how your data is used and shared</p>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Two-Factor Authentication</h3>
              <p className={styles.settingDescription}>
                Add an extra layer of security to your account
              </p>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
