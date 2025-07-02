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

const Settings = (): JSX.Element => {
  const { t } = useCommonTranslation();

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
  });

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
