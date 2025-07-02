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

interface BillingInfo {
  currentPlan: 'free' | 'premium' | 'pro';
  nextBillingDate: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  paymentMethod: {
    type: 'card' | 'paypal';
    lastFour?: string;
    brand?: string;
  };
  usage: {
    goalsUsed: number;
    goalsLimit: number;
    habitsUsed: number;
    habitsLimit: number;
    storageUsed: number; // in MB
    storageLimit: number; // in MB
  };
}

interface PrivacySettings {
  profileVisibility: boolean;
  searchIndexing: boolean;
  analyticsOptOut: boolean;
  marketingCommunications: boolean;
  functionalCookies: boolean;
  analyticsCookies: boolean;
  marketingCookies: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  smsBackup: boolean;
  hasBackupCodes: boolean;
  trustedDevices: number;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  browser: string;
  loginTime: string;
  ipAddress: string;
  isCurrent: boolean;
}

// Create custom icons
const CreditCardIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CrownIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2 20h20l-2-10-6 4-4-4-6 4-2 10z" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="5" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="19" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10l6 6M22 16l-2-2M18 14l-2-2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const DevicesIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const QrCodeIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="5" height="5" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="16" width="5" height="5" stroke="currentColor" strokeWidth="2" />
    <rect x="16" y="3" width="5" height="5" stroke="currentColor" strokeWidth="2" />
    <path d="M21 16h-3a2 2 0 00-2 2v3" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21v.01" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v3a2 2 0 002 2h3" stroke="currentColor" strokeWidth="2" />
    <path d="M3 12h.01" stroke="currentColor" strokeWidth="2" />
    <path d="M12 3h.01" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16v.01" stroke="currentColor" strokeWidth="2" />
    <path d="M16 12h1" stroke="currentColor" strokeWidth="2" />
    <path d="M21 12v.01" stroke="currentColor" strokeWidth="2" />
    <path d="M12 21v-1" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Settings = (): JSX.Element => {
  const { t } = useCommonTranslation();

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: true,
    searchIndexing: false,
    analyticsOptOut: false,
    marketingCommunications: true,
    functionalCookies: true,
    analyticsCookies: true,
    marketingCookies: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    smsBackup: false,
    hasBackupCodes: false,
    trustedDevices: 3,
  });

  // Mock login sessions data
  const [loginSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      browser: 'Chrome 119',
      loginTime: '2024-01-25T10:30:00Z',
      ipAddress: '192.168.1.1',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      location: 'San Francisco, CA',
      browser: 'Safari',
      loginTime: '2024-01-24T14:20:00Z',
      ipAddress: '192.168.1.2',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Windows PC',
      location: 'New York, NY',
      browser: 'Firefox 120',
      loginTime: '2024-01-23T09:15:00Z',
      ipAddress: '10.0.0.1',
      isCurrent: false,
    },
  ]);

  // Mock billing information - in real app this would come from API
  const [billingInfo] = useState<BillingInfo>({
    currentPlan: 'premium',
    nextBillingDate: '2024-02-15',
    billingCycle: 'monthly',
    amount: 9.99,
    currency: 'USD',
    paymentMethod: {
      type: 'card',
      lastFour: '4242',
      brand: 'Visa',
    },
    usage: {
      goalsUsed: 12,
      goalsLimit: 50,
      habitsUsed: 8,
      habitsLimit: 25,
      storageUsed: 245,
      storageLimit: 1024,
    },
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

  // Handle privacy setting changes
  const handlePrivacyChange = (setting: keyof PrivacySettings, enabled: boolean): void => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: enabled,
    }));

    // TODO: Save to backend/localStorage
    console.info(`Privacy ${setting} set to:`, enabled);
  };

  // Handle security setting changes
  const handleSecurityChange = (setting: keyof SecuritySettings, enabled: boolean): void => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: enabled,
    }));

    // TODO: Save to backend/localStorage
    console.info(`Security ${setting} set to:`, enabled);
  };

  // Calculate security score
  const calculateSecurityScore = (): number => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 40;
    if (securitySettings.smsBackup) score += 20;
    if (securitySettings.hasBackupCodes) score += 20;
    if (securitySettings.trustedDevices <= 3) score += 20;
    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();

  // Get security score color
  const getSecurityScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  // Format date for login history
  const formatLoginDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle data export
  const handleDataExport = (format: 'json' | 'csv'): void => {
    console.info(`Exporting data in ${format} format`);
    // TODO: Implement actual data export
  };

  // Handle account deletion
  const handleDeleteAccount = (): void => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      const finalConfirm = window.confirm(
        'This will permanently delete all your data. Type "DELETE" to confirm.'
      );
      if (finalConfirm) {
        console.info('Account deletion initiated');
        // TODO: Implement actual account deletion
      }
    }
  };

  // Handle 2FA setup
  const handleTwoFactorSetup = (): void => {
    console.info('Opening 2FA setup modal');
    // TODO: Open 2FA setup modal
  };

  // Handle backup codes generation
  const handleGenerateBackupCodes = (): void => {
    console.info('Generating backup codes');
    setSecuritySettings(prev => ({ ...prev, hasBackupCodes: true }));
    // TODO: Generate and show backup codes
  };

  // Handle login history view
  const handleViewLoginHistory = (): void => {
    console.info('Opening login history modal');
    // TODO: Open login history modal with detailed view
  };

  // Handle sign out all sessions
  const handleSignOutAllSessions = (): void => {
    const confirmed = window.confirm('This will sign you out of all devices. Continue?');
    if (confirmed) {
      console.info('Signing out all sessions');
      // TODO: Implement sign out all sessions
    }
  };

  // Get plan display information
  const getPlanInfo = (
    plan: BillingInfo['currentPlan']
  ): { name: string; color: string; icon: string } => {
    switch (plan) {
      case 'free':
        return { name: 'Free Plan', color: '#6b7280', icon: '📱' };
      case 'premium':
        return { name: 'Premium Plan', color: '#8b5cf6', icon: '⭐' };
      case 'pro':
        return { name: 'Pro Plan', color: '#f59e0b', icon: '👑' };
      default:
        return { name: 'Unknown Plan', color: '#6b7280', icon: '❓' };
    }
  };

  const planInfo = getPlanInfo(billingInfo.currentPlan);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate usage percentage
  const getUsagePercentage = (used: number, limit: number): number => {
    return Math.round((used / limit) * 100);
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

        {/* Plans & Billing Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Plans & Billing</h2>
          <p className={styles.sectionDescription}>
            Manage your subscription, billing information, and usage
          </p>

          {/* Current Plan */}
          <div className={styles.billingCard}>
            <div className={styles.planHeader}>
              <div className={styles.planInfo}>
                <div className={styles.planIcon} style={{ backgroundColor: planInfo.color }}>
                  <CrownIcon className={styles.planIconSvg} />
                </div>
                <div>
                  <h3 className={styles.planName}>{planInfo.name}</h3>
                  <p className={styles.planPrice}>
                    ${billingInfo.amount}/
                    {billingInfo.billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>
              <button className={styles.managePlanButton}>Manage Plan</button>
            </div>

            {/* Billing Information */}
            <div className={styles.billingDetails}>
              <div className={styles.billingItem}>
                <div className={styles.billingItemIcon}>
                  <CalendarIcon className={styles.icon} />
                </div>
                <div className={styles.billingItemContent}>
                  <span className={styles.billingLabel}>Next Billing Date</span>
                  <span className={styles.billingValue}>
                    {formatDate(billingInfo.nextBillingDate)}
                  </span>
                </div>
              </div>

              <div className={styles.billingItem}>
                <div className={styles.billingItemIcon}>
                  <CreditCardIcon className={styles.icon} />
                </div>
                <div className={styles.billingItemContent}>
                  <span className={styles.billingLabel}>Payment Method</span>
                  <span className={styles.billingValue}>
                    {billingInfo.paymentMethod.brand} ••••{billingInfo.paymentMethod.lastFour}
                  </span>
                </div>
                <button className={styles.updateButton}>Update</button>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className={styles.usageSection}>
              <h4 className={styles.usageTitle}>Current Usage</h4>

              <div className={styles.usageStats}>
                <div className={styles.usageStat}>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>Goals</span>
                    <span className={styles.usageNumbers}>
                      {billingInfo.usage.goalsUsed} / {billingInfo.usage.goalsLimit}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${getUsagePercentage(billingInfo.usage.goalsUsed, billingInfo.usage.goalsLimit)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.usageStat}>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>Habits</span>
                    <span className={styles.usageNumbers}>
                      {billingInfo.usage.habitsUsed} / {billingInfo.usage.habitsLimit}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${getUsagePercentage(billingInfo.usage.habitsUsed, billingInfo.usage.habitsLimit)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.usageStat}>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>Storage</span>
                    <span className={styles.usageNumbers}>
                      {billingInfo.usage.storageUsed}MB / {billingInfo.usage.storageLimit}MB
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${getUsagePercentage(billingInfo.usage.storageUsed, billingInfo.usage.storageLimit)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.billingActions}>
              <button className={styles.actionButton}>View Billing History</button>
              <button className={styles.actionButton}>Download Invoice</button>
              <button className={styles.actionButtonSecondary}>Cancel Subscription</button>
            </div>
          </div>
        </div>

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

        {/* Privacy & Security Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy & Security</h2>
          <p className={styles.sectionDescription}>
            Manage your privacy settings and account security
          </p>

          {/* Security Score */}
          <div className={styles.securityScore}>
            <div className={styles.securityScoreHeader}>
              <div className={styles.securityScoreInfo}>
                <ShieldIcon className={styles.securityScoreIcon} />
                <div>
                  <h3 className={styles.securityScoreTitle}>Security Score</h3>
                  <p className={styles.securityScoreDescription}>
                    Your account security level based on enabled features
                  </p>
                </div>
              </div>
              <div className={styles.securityScoreValue}>
                <span
                  className={styles.securityScoreNumber}
                  style={{ color: getSecurityScoreColor(securityScore) }}
                >
                  {securityScore}%
                </span>
              </div>
            </div>
            <div className={styles.securityScoreBar}>
              <div
                className={styles.securityScoreProgress}
                style={{
                  width: `${securityScore}%`,
                  backgroundColor: getSecurityScoreColor(securityScore),
                }}
              />
            </div>
          </div>

          {/* Data Management */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>Data Management</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Export Your Data</h4>
                <p className={styles.settingDescription}>
                  Download a copy of all your data in JSON or CSV format
                </p>
              </div>
              <div className={styles.settingControl}>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.actionButtonSmall}
                    onClick={() => handleDataExport('json')}
                  >
                    <DownloadIcon className={styles.buttonIcon} />
                    JSON
                  </button>
                  <button
                    className={styles.actionButtonSmall}
                    onClick={() => handleDataExport('csv')}
                  >
                    <DownloadIcon className={styles.buttonIcon} />
                    CSV
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Delete Account</h4>
                <p className={styles.settingDescription}>
                  Permanently delete your account and all associated data
                </p>
              </div>
              <div className={styles.settingControl}>
                <button className={styles.dangerButton} onClick={handleDeleteAccount}>
                  <TrashIcon className={styles.buttonIcon} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Profile Visibility */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>Profile Visibility</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Public Profile</h4>
                <p className={styles.settingDescription}>
                  Allow others to view your profile and goals
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.profileVisibility}
                  onChange={enabled => handlePrivacyChange('profileVisibility', enabled)}
                  aria-label="Toggle public profile visibility"
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Search Engine Indexing</h4>
                <p className={styles.settingDescription}>
                  Allow search engines to index your public profile
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.searchIndexing}
                  onChange={enabled => handlePrivacyChange('searchIndexing', enabled)}
                  aria-label="Toggle search engine indexing"
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Analytics Opt-out</h4>
                <p className={styles.settingDescription}>
                  Disable usage analytics collection to improve the platform
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.analyticsOptOut}
                  onChange={enabled => handlePrivacyChange('analyticsOptOut', enabled)}
                  aria-label="Toggle analytics opt-out"
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Marketing Communications</h4>
                <p className={styles.settingDescription}>
                  Receive promotional emails and product updates
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.marketingCommunications}
                  onChange={enabled => handlePrivacyChange('marketingCommunications', enabled)}
                  aria-label="Toggle marketing communications"
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Cookie Preferences */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>Cookie Preferences</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Functional Cookies</h4>
                <p className={styles.settingDescription}>
                  Required for basic functionality (cannot be disabled)
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.functionalCookies}
                  onChange={() => {}} // Disabled
                  aria-label="Functional cookies (required)"
                  size="medium"
                  disabled
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Analytics Cookies</h4>
                <p className={styles.settingDescription}>
                  Help us understand how you use the platform
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.analyticsCookies}
                  onChange={enabled => handlePrivacyChange('analyticsCookies', enabled)}
                  aria-label="Toggle analytics cookies"
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Marketing Cookies</h4>
                <p className={styles.settingDescription}>
                  Used to show you relevant ads and offers
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.marketingCookies}
                  onChange={enabled => handlePrivacyChange('marketingCookies', enabled)}
                  aria-label="Toggle marketing cookies"
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>Two-Factor Authentication</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  Two-Factor Authentication
                  {securitySettings.twoFactorEnabled && (
                    <span className={styles.enabledBadge}>Enabled</span>
                  )}
                </h4>
                <p className={styles.settingDescription}>
                  Add an extra layer of security using an authenticator app
                </p>
              </div>
              <div className={styles.settingControl}>
                {securitySettings.twoFactorEnabled ? (
                  <button
                    className={styles.actionButtonSmall}
                    onClick={() => handleSecurityChange('twoFactorEnabled', false)}
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button className={styles.primaryButton} onClick={handleTwoFactorSetup}>
                    <QrCodeIcon className={styles.buttonIcon} />
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>

            {securitySettings.twoFactorEnabled && (
              <>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4 className={styles.settingLabel}>Backup Codes</h4>
                    <p className={styles.settingDescription}>
                      Generate backup codes for account recovery
                    </p>
                  </div>
                  <div className={styles.settingControl}>
                    <button
                      className={styles.actionButtonSmall}
                      onClick={handleGenerateBackupCodes}
                    >
                      <KeyIcon className={styles.buttonIcon} />
                      {securitySettings.hasBackupCodes ? 'Regenerate' : 'Generate'} Codes
                    </button>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4 className={styles.settingLabel}>SMS Backup</h4>
                    <p className={styles.settingDescription}>
                      Use SMS as a backup method for two-factor authentication
                    </p>
                  </div>
                  <div className={styles.settingControl}>
                    <Toggle
                      enabled={securitySettings.smsBackup}
                      onChange={enabled => handleSecurityChange('smsBackup', enabled)}
                      aria-label="Toggle SMS backup"
                      size="medium"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account Security */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>Account Security</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Login History</h4>
                <p className={styles.settingDescription}>
                  View recent login attempts and device information
                </p>
              </div>
              <div className={styles.settingControl}>
                <button className={styles.actionButtonSmall} onClick={handleViewLoginHistory}>
                  <HistoryIcon className={styles.buttonIcon} />
                  View History
                </button>
              </div>
            </div>

            {/* Recent Login Sessions Preview */}
            <div className={styles.loginSessionsPreview}>
              <h4 className={styles.subsectionTitle}>Recent Sessions</h4>
              <div className={styles.loginSessionsList}>
                {loginSessions.slice(0, 3).map(session => (
                  <div key={session.id} className={styles.loginSessionItem}>
                    <div className={styles.sessionIcon}>
                      <DevicesIcon className={styles.icon} />
                    </div>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionHeader}>
                        <span className={styles.sessionDevice}>{session.device}</span>
                        {session.isCurrent && (
                          <span className={styles.currentSessionBadge}>Current</span>
                        )}
                      </div>
                      <div className={styles.sessionDetails}>
                        <span className={styles.sessionLocation}>{session.location}</span>
                        <span className={styles.sessionDot}>•</span>
                        <span className={styles.sessionTime}>
                          {formatLoginDate(session.loginTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Active Sessions</h4>
                <p className={styles.settingDescription}>Sign out of all devices except this one</p>
              </div>
              <div className={styles.settingControl}>
                <button className={styles.actionButtonSecondary} onClick={handleSignOutAllSessions}>
                  Sign Out All Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
