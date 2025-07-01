import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { SettingsIcon } from '@/shared/components/common/icons';
import ThemeSelector from '@/shared/components/theme/ThemeSelector';
import LanguageSelector from '@/shared/components/i18n/LanguageSelector';
import ProfileSettings from '@/shared/components/user/ProfileSettings';
import styles from './Settings.module.css';

const Settings = (): JSX.Element => {
  const { t } = useCommonTranslation();

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
              <p className={styles.settingDescription}>Receive updates via email</p>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Push Notifications</h3>
              <p className={styles.settingDescription}>
                Receive push notifications in your browser
              </p>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.comingSoon}>Coming Soon</span>
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
              <p className={styles.settingDescription}>Control how your data is used</p>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Change Password</h3>
              <p className={styles.settingDescription}>Update your account password</p>
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
