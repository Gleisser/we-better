import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { SettingsIcon } from '@/shared/components/common/icons';
import ThemeSelector from '@/shared/components/theme/ThemeSelector';
import LanguageSelector from '@/shared/components/i18n/LanguageSelector';
import ProfileSettings from '@/shared/components/user/ProfileSettings';
import Toggle from '@/shared/components/common/Toggle';
import { preferencesService } from '@/core/services/preferencesService';
import {
  fetchSecuritySettings,
  updateSecuritySettings,
  setup2FA,
  generateBackupCodes,
  getSecurityScore,
} from '@/core/services/securityService';
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

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
      title: t('settings.title') as string,
      subtitle: t('settings.subtitle') as string,
      sections: {
        plansAndBilling: t('settings.sections.plansAndBilling') as string,
        general: t('settings.sections.general') as string,
        notifications: t('settings.sections.notifications') as string,
        privacyAndSecurity: t('settings.sections.privacyAndSecurity') as string,
      },
      descriptions: {
        plansAndBilling: t('settings.descriptions.plansAndBilling') as string,
        general: t('settings.descriptions.general') as string,
        notifications: t('settings.descriptions.notifications') as string,
        privacyAndSecurity: t('settings.descriptions.privacyAndSecurity') as string,
      },
      billing: {
        managePlan: t('settings.billing.managePlan') as string,
        nextBillingDate: t('settings.billing.nextBillingDate') as string,
        paymentMethod: t('settings.billing.paymentMethod') as string,
        update: t('settings.billing.update') as string,
        currentUsage: t('settings.billing.currentUsage') as string,
        viewBillingHistory: t('settings.billing.viewBillingHistory') as string,
        downloadInvoice: t('settings.billing.downloadInvoice') as string,
        cancelSubscription: t('settings.billing.cancelSubscription') as string,
        usage: {
          goals: t('settings.billing.usage.goals') as string,
          habits: t('settings.billing.usage.habits') as string,
          storage: t('settings.billing.usage.storage') as string,
        },
        billing: {
          monthly: t('settings.billing.billing.monthly') as string,
          yearly: t('settings.billing.billing.yearly') as string,
        },
      },
      notifications: {
        emailNotifications: t('settings.notifications.emailNotifications') as string,
        emailDescription: t('settings.notifications.emailDescription') as string,
        pushNotifications: t('settings.notifications.pushNotifications') as string,
        pushDescription: t('settings.notifications.pushDescription') as string,
      },
      privacy: {
        securityScore: {
          title: t('settings.privacy.securityScore.title') as string,
          description: t('settings.privacy.securityScore.description') as string,
        },
        dataManagement: {
          title: t('settings.privacy.dataManagement.title') as string,
          exportData: t('settings.privacy.dataManagement.exportData') as string,
          exportDescription: t('settings.privacy.dataManagement.exportDescription') as string,
          deleteAccount: t('settings.privacy.dataManagement.deleteAccount') as string,
          deleteDescription: t('settings.privacy.dataManagement.deleteDescription') as string,
          confirmDelete: t('settings.privacy.dataManagement.confirmDelete') as string,
          finalConfirm: t('settings.privacy.dataManagement.finalConfirm') as string,
          deletionInitiated: t('settings.privacy.dataManagement.deletionInitiated') as string,
        },
        profileVisibility: {
          title: t('settings.privacy.profileVisibility.title') as string,
          publicProfile: t('settings.privacy.profileVisibility.publicProfile') as string,
          publicDescription: t('settings.privacy.profileVisibility.publicDescription') as string,
          searchIndexing: t('settings.privacy.profileVisibility.searchIndexing') as string,
          searchDescription: t('settings.privacy.profileVisibility.searchDescription') as string,
          analyticsOptOut: t('settings.privacy.profileVisibility.analyticsOptOut') as string,
          analyticsDescription: t(
            'settings.privacy.profileVisibility.analyticsDescription'
          ) as string,
          marketingCommunications: t(
            'settings.privacy.profileVisibility.marketingCommunications'
          ) as string,
          marketingDescription: t(
            'settings.privacy.profileVisibility.marketingDescription'
          ) as string,
        },
        cookies: {
          title: t('settings.privacy.cookies.title') as string,
          functional: t('settings.privacy.cookies.functional') as string,
          functionalDescription: t('settings.privacy.cookies.functionalDescription') as string,
          analytics: t('settings.privacy.cookies.analytics') as string,
          analyticsDescription: t('settings.privacy.cookies.analyticsDescription') as string,
          marketing: t('settings.privacy.cookies.marketing') as string,
          marketingDescription: t('settings.privacy.cookies.marketingDescription') as string,
        },
        twoFactor: {
          title: t('settings.privacy.twoFactor.title') as string,
          description: t('settings.privacy.twoFactor.description') as string,
          enabled: t('settings.privacy.twoFactor.enabled') as string,
          enable: t('settings.privacy.twoFactor.enable') as string,
          disable: t('settings.privacy.twoFactor.disable') as string,
          backupCodes: t('settings.privacy.twoFactor.backupCodes') as string,
          backupDescription: t('settings.privacy.twoFactor.backupDescription') as string,
          generate: t('settings.privacy.twoFactor.generate') as string,
          regenerate: t('settings.privacy.twoFactor.regenerate') as string,
          smsBackup: t('settings.privacy.twoFactor.smsBackup') as string,
          smsDescription: t('settings.privacy.twoFactor.smsDescription') as string,
          setupModal: t('settings.privacy.twoFactor.setupModal') as string,
          generatingCodes: t('settings.privacy.twoFactor.generatingCodes') as string,
        },
        accountSecurity: {
          title: t('settings.privacy.accountSecurity.title') as string,
          loginHistory: t('settings.privacy.accountSecurity.loginHistory') as string,
          loginDescription: t('settings.privacy.accountSecurity.loginDescription') as string,
          viewHistory: t('settings.privacy.accountSecurity.viewHistory') as string,
          recentSessions: t('settings.privacy.accountSecurity.recentSessions') as string,
          activeSessions: t('settings.privacy.accountSecurity.activeSessions') as string,
          activeDescription: t('settings.privacy.accountSecurity.activeDescription') as string,
          signOutAll: t('settings.privacy.accountSecurity.signOutAll') as string,
          signOutConfirm: t('settings.privacy.accountSecurity.signOutConfirm') as string,
          current: t('settings.privacy.accountSecurity.current') as string,
          timeAgo: {
            justNow: t('settings.privacy.accountSecurity.timeAgo.justNow') as string,
            hoursAgo: t('settings.privacy.accountSecurity.timeAgo.hoursAgo') as string,
            yesterday: t('settings.privacy.accountSecurity.timeAgo.yesterday') as string,
            daysAgo: t('settings.privacy.accountSecurity.timeAgo.daysAgo') as string,
          },
          viewingHistory: t('settings.privacy.accountSecurity.viewingHistory') as string,
          signingOutSessions: t('settings.privacy.accountSecurity.signingOutSessions') as string,
        },
      },
      actions: {
        json: t('settings.actions.json') as string,
        csv: t('settings.actions.csv') as string,
        delete: t('settings.actions.delete') as string,
        update: t('settings.actions.update') as string,
        enable: t('settings.actions.enable') as string,
        disable: t('settings.actions.disable') as string,
        generate: t('settings.actions.generate') as string,
        regenerate: t('settings.actions.regenerate') as string,
        viewHistory: t('settings.actions.viewHistory') as string,
        signOut: t('settings.actions.signOut') as string,
        save: t('settings.actions.save') as string,
        cancel: t('settings.actions.cancel') as string,
        edit: t('settings.actions.edit') as string,
        upload: t('settings.actions.upload') as string,
        replace: t('settings.actions.replace') as string,
        manage: t('settings.actions.manage') as string,
      },
    }),
    [t]
  );

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Security score state
  const [securityScoreData, setSecurityScoreData] = useState<number>(0);

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setSuccess(null);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const [notificationsResult, privacyResult, securityResult, securityScoreResult] =
          await Promise.all([
            preferencesService.getNotificationSettings(),
            preferencesService.getPrivacySettings(),
            fetchSecuritySettings(),
            getSecurityScore(),
          ]);

        if (notificationsResult.data) {
          // Map backend format to frontend format
          setNotificationSettings({
            emailNotifications: notificationsResult.data.email_notifications,
            pushNotifications: notificationsResult.data.push_notifications,
          });
        }

        if (privacyResult.data) {
          // Map backend format to frontend format
          setPrivacySettings({
            profileVisibility: privacyResult.data.profile_visibility,
            searchIndexing: privacyResult.data.search_indexing,
            analyticsOptOut: privacyResult.data.analytics_opt_out,
            marketingCommunications: privacyResult.data.marketing_communications,
            functionalCookies: privacyResult.data.functional_cookies,
            analyticsCookies: privacyResult.data.analytics_cookies,
            marketingCookies: privacyResult.data.marketing_cookies,
          });
        }

        if (securityResult) {
          setSecuritySettings({
            twoFactorEnabled: securityResult.two_factor_enabled,
            smsBackup: securityResult.sms_backup_enabled,
            hasBackupCodes: securityResult.backup_codes_generated,
            trustedDevices: 0, // TODO: Add trusted devices count from sessions API
          });
        }

        if (securityScoreResult) {
          setSecurityScoreData(securityScoreResult.overall_score);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Failed to load settings. Please refresh the page.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [showNotification]);

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
  const handleNotificationChange = async (
    setting: keyof NotificationSettings,
    enabled: boolean
  ): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Optimistically update UI
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: enabled,
      }));

      // Map frontend setting to backend field
      const backendField =
        setting === 'emailNotifications' ? 'email_notifications' : 'push_notifications';

      const result = await preferencesService.patchNotificationSettings({
        [backendField]: enabled,
      });

      if (result.error) {
        // Revert on error
        setNotificationSettings(prev => ({
          ...prev,
          [setting]: !enabled,
        }));
        showNotification(result.error, 'error');
      } else {
        showNotification('Notification setting updated successfully', 'success');
      }
    } catch {
      // Revert on error
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: !enabled,
      }));
      showNotification('Failed to update notification setting', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle privacy setting changes
  const handlePrivacyChange = async (
    setting: keyof PrivacySettings,
    enabled: boolean
  ): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Optimistically update UI
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: enabled,
      }));

      // Map frontend setting to backend field
      const backendFieldMap: Record<keyof PrivacySettings, string> = {
        profileVisibility: 'profile_visibility',
        searchIndexing: 'search_indexing',
        analyticsOptOut: 'analytics_opt_out',
        marketingCommunications: 'marketing_communications',
        functionalCookies: 'functional_cookies',
        analyticsCookies: 'analytics_cookies',
        marketingCookies: 'marketing_cookies',
      };

      const backendField = backendFieldMap[setting];

      let result;
      if (['functionalCookies', 'analyticsCookies', 'marketingCookies'].includes(setting)) {
        // Use cookie consent endpoint for cookie settings
        result = await preferencesService.updateCookieConsent({
          [backendField]: enabled,
        });
      } else {
        // Use regular privacy settings endpoint
        const updateData: Record<string, boolean> = {};
        updateData[backendField] = enabled;
        result = await preferencesService.updatePrivacySettings(updateData);
      }

      if (result.error) {
        // Revert on error
        setPrivacySettings(prev => ({
          ...prev,
          [setting]: !enabled,
        }));
        showNotification(result.error, 'error');
      } else {
        showNotification('Privacy setting updated successfully', 'success');
      }
    } catch {
      // Revert on error
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: !enabled,
      }));
      showNotification('Failed to update privacy setting', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle security setting changes
  const handleSecurityChange = async (
    setting: keyof SecuritySettings,
    enabled: boolean
  ): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Handle different security settings
      if (setting === 'twoFactorEnabled') {
        if (enabled) {
          // Redirect to 2FA setup
          handleTwoFactorSetup();
        } else {
          // Disable 2FA (this would need a confirmation dialog)
          showNotification('2FA disable functionality coming soon', 'error');
        }
      } else {
        // For other settings, optimistically update
        setSecuritySettings(prev => ({
          ...prev,
          [setting]: enabled,
        }));

        const backendFieldMap: Record<string, string> = {
          smsBackup: 'sms_backup_enabled',
        };

        const backendField = backendFieldMap[setting];
        if (backendField) {
          const updateData: Record<string, boolean> = {};
          updateData[backendField] = enabled;

          const result = await updateSecuritySettings(updateData);

          if (!result) {
            // Revert on error
            setSecuritySettings(prev => ({
              ...prev,
              [setting]: !enabled,
            }));
            showNotification('Failed to update security setting', 'error');
          } else {
            showNotification('Security setting updated successfully', 'success');
          }
        }
      }
    } catch {
      // Revert on error
      setSecuritySettings(prev => ({
        ...prev,
        [setting]: !enabled,
      }));
      showNotification('Failed to update security setting', 'error');
    } finally {
      setIsSaving(false);
    }
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

  const securityScore = securityScoreData || calculateSecurityScore();

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

    if (diffInHours < 1) return translations.privacy.accountSecurity.timeAgo.justNow;
    if (diffInHours < 24)
      return translations.privacy.accountSecurity.timeAgo.hoursAgo.replace(
        '{{count}}',
        diffInHours.toString()
      );
    if (diffInHours < 48) return translations.privacy.accountSecurity.timeAgo.yesterday;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle data export
  const handleDataExport = async (format: 'json' | 'csv'): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // For now, show a placeholder message - Data Management API will be integrated later
      showNotification(`Data export in ${format} format will be available soon`, 'success');
      // TODO: Integrate data management API when ready
      // const response = await fetch(`${API_URL}/data/export`, {
      //   method: 'POST',
      //   body: JSON.stringify({ format, sections: ['all'] })
      // });
    } catch {
      showNotification('Failed to initiate data export', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (): Promise<void> => {
    if (isSaving) return;

    const confirmed = window.confirm(translations.privacy.dataManagement.confirmDelete);
    if (!confirmed) return;

    const finalConfirm = window.confirm(translations.privacy.dataManagement.finalConfirm);
    if (!finalConfirm) return;

    setIsSaving(true);
    try {
      // For now, show a placeholder message - Account deletion API will be integrated later
      showNotification('Account deletion will be available soon', 'success');
      // TODO: Integrate account deletion API when ready
      // const response = await fetch(`${API_URL}/data/delete`, {
      //   method: 'POST',
      //   body: JSON.stringify({ reason: 'user_request' })
      // });
    } catch {
      showNotification('Failed to initiate account deletion', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle 2FA setup
  const handleTwoFactorSetup = async (): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await setup2FA();
      if (result) {
        showNotification('2FA setup initiated successfully', 'success');
        // TODO: Open 2FA setup modal with QR code
        console.info('2FA Setup Response:', result);
      } else {
        showNotification('Failed to initiate 2FA setup', 'error');
      }
    } catch {
      showNotification('Failed to setup 2FA', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle backup codes generation
  const handleGenerateBackupCodes = async (): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await generateBackupCodes();
      if (result) {
        setSecuritySettings(prev => ({ ...prev, hasBackupCodes: true }));
        showNotification('Backup codes generated successfully', 'success');
        // TODO: Show backup codes in modal
        console.info('Backup Codes:', result.backup_codes);
      } else {
        showNotification('Failed to generate backup codes', 'error');
      }
    } catch {
      showNotification('Failed to generate backup codes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle login history view
  const handleViewLoginHistory = async (): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // For now, show a placeholder message - Sessions API will be integrated later
      showNotification('Detailed login history will be available soon', 'success');
      // TODO: Integrate sessions API when ready
      // const sessions = await fetchLoginSessions();
      // Show sessions in modal
    } catch {
      showNotification('Failed to load login history', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle sign out all sessions
  const handleSignOutAllSessions = async (): Promise<void> => {
    if (isSaving) return;

    const confirmed = window.confirm(translations.privacy.accountSecurity.signOutConfirm);
    if (!confirmed) return;

    setIsSaving(true);
    try {
      // For now, show a placeholder message - Sessions API will be integrated later
      showNotification('Sign out all sessions will be available soon', 'success');
      // TODO: Integrate sessions API when ready
      // const result = await signOutAllSessions();
      // Refresh login sessions data
    } catch {
      showNotification('Failed to sign out all sessions', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Get plan display information
  const getPlanInfo = (
    plan: BillingInfo['currentPlan']
  ): { name: string; color: string; icon: string } => {
    switch (plan) {
      case 'free':
        return { name: t('settings.billing.plans.free') as string, color: '#6b7280', icon: '📱' };
      case 'premium':
        return {
          name: t('settings.billing.plans.premium') as string,
          color: '#8b5cf6',
          icon: '⭐',
        };
      case 'pro':
        return { name: t('settings.billing.plans.pro') as string, color: '#f59e0b', icon: '👑' };
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
          <h1 className={styles.title}>{translations.title}</h1>
        </div>
        <p className={styles.subtitle}>{translations.subtitle}</p>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading settings...</p>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className={styles.errorNotification}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Success notification */}
      {success && (
        <div className={styles.successNotification}>
          <p>{success}</p>
          <button onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      <div className={styles.content}>
        <ProfileSettings className={styles.profileSettings} />

        {/* Plans & Billing Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.sections.plansAndBilling}</h2>
          <p className={styles.sectionDescription}>{translations.descriptions.plansAndBilling}</p>

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
                    {billingInfo.billingCycle === 'monthly'
                      ? translations.billing.billing.monthly
                      : translations.billing.billing.yearly}
                  </p>
                </div>
              </div>
              <button className={styles.managePlanButton}>{translations.billing.managePlan}</button>
            </div>

            {/* Billing Information */}
            <div className={styles.billingDetails}>
              <div className={styles.billingItem}>
                <div className={styles.billingItemIcon}>
                  <CalendarIcon className={styles.icon} />
                </div>
                <div className={styles.billingItemContent}>
                  <span className={styles.billingLabel}>
                    {translations.billing.nextBillingDate}
                  </span>
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
                  <span className={styles.billingLabel}>{translations.billing.paymentMethod}</span>
                  <span className={styles.billingValue}>
                    {billingInfo.paymentMethod.brand} ••••{billingInfo.paymentMethod.lastFour}
                  </span>
                </div>
                <button className={styles.updateButton}>{translations.billing.update}</button>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className={styles.usageSection}>
              <h4 className={styles.usageTitle}>{translations.billing.currentUsage}</h4>

              <div className={styles.usageStats}>
                <div className={styles.usageStat}>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>{translations.billing.usage.goals}</span>
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
                    <span className={styles.usageLabel}>{translations.billing.usage.habits}</span>
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
                    <span className={styles.usageLabel}>{translations.billing.usage.storage}</span>
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
              <button className={styles.actionButton}>
                {translations.billing.viewBillingHistory}
              </button>
              <button className={styles.actionButton}>
                {translations.billing.downloadInvoice}
              </button>
              <button className={styles.actionButtonSecondary}>
                {translations.billing.cancelSubscription}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.sections.general}</h2>
          <p className={styles.sectionDescription}>{translations.descriptions.general}</p>

          <ThemeSelector className={styles.themeSelector} />

          <LanguageSelector className={styles.languageSelector} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.sections.notifications}</h2>
          <p className={styles.sectionDescription}>{translations.descriptions.notifications}</p>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>
                {translations.notifications.emailNotifications}
              </h3>
              <p className={styles.settingDescription}>
                {translations.notifications.emailDescription}
              </p>
            </div>
            <div className={styles.settingControl}>
              <Toggle
                enabled={notificationSettings.emailNotifications}
                onChange={enabled => handleNotificationChange('emailNotifications', enabled)}
                aria-label={`Toggle ${translations.notifications.emailNotifications}`}
                size="medium"
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>
                {translations.notifications.pushNotifications}
              </h3>
              <p className={styles.settingDescription}>
                {translations.notifications.pushDescription}
              </p>
            </div>
            <div className={styles.settingControl}>
              <Toggle
                enabled={notificationSettings.pushNotifications}
                onChange={enabled => handleNotificationChange('pushNotifications', enabled)}
                aria-label={`Toggle ${translations.notifications.pushNotifications}`}
                size="medium"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.sections.privacyAndSecurity}</h2>
          <p className={styles.sectionDescription}>
            {translations.descriptions.privacyAndSecurity}
          </p>

          {/* Security Score */}
          <div className={styles.securityScore}>
            <div className={styles.securityScoreHeader}>
              <div className={styles.securityScoreInfo}>
                <ShieldIcon className={styles.securityScoreIcon} />
                <div>
                  <h3 className={styles.securityScoreTitle}>
                    {translations.privacy.securityScore.title}
                  </h3>
                  <p className={styles.securityScoreDescription}>
                    {translations.privacy.securityScore.description}
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
            <h3 className={styles.subsectionTitle}>{translations.privacy.dataManagement.title}</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.dataManagement.exportData}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.dataManagement.exportDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.actionButtonSmall}
                    onClick={() => handleDataExport('json')}
                  >
                    <DownloadIcon className={styles.buttonIcon} />
                    {translations.actions.json}
                  </button>
                  <button
                    className={styles.actionButtonSmall}
                    onClick={() => handleDataExport('csv')}
                  >
                    <DownloadIcon className={styles.buttonIcon} />
                    {translations.actions.csv}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.dataManagement.deleteAccount}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.dataManagement.deleteDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <button className={styles.dangerButton} onClick={handleDeleteAccount}>
                  <TrashIcon className={styles.buttonIcon} />
                  {translations.privacy.dataManagement.deleteAccount}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Visibility */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>
              {translations.privacy.profileVisibility.title}
            </h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.profileVisibility.publicProfile}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.profileVisibility.publicDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.profileVisibility}
                  onChange={enabled => handlePrivacyChange('profileVisibility', enabled)}
                  aria-label={`Toggle ${translations.privacy.profileVisibility.publicProfile}`}
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.profileVisibility.searchIndexing}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.profileVisibility.searchDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.searchIndexing}
                  onChange={enabled => handlePrivacyChange('searchIndexing', enabled)}
                  aria-label={`Toggle ${translations.privacy.profileVisibility.searchIndexing}`}
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.profileVisibility.analyticsOptOut}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.profileVisibility.analyticsDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.analyticsOptOut}
                  onChange={enabled => handlePrivacyChange('analyticsOptOut', enabled)}
                  aria-label={`Toggle ${translations.privacy.profileVisibility.analyticsOptOut}`}
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.profileVisibility.marketingCommunications}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.profileVisibility.marketingDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.marketingCommunications}
                  onChange={enabled => handlePrivacyChange('marketingCommunications', enabled)}
                  aria-label={`Toggle ${translations.privacy.profileVisibility.marketingCommunications}`}
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Cookie Preferences */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>{translations.privacy.cookies.title}</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>{translations.privacy.cookies.functional}</h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.cookies.functionalDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.functionalCookies}
                  onChange={() => {}} // Disabled
                  aria-label={translations.privacy.cookies.functional}
                  size="medium"
                  disabled
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>{translations.privacy.cookies.analytics}</h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.cookies.analyticsDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.analyticsCookies}
                  onChange={enabled => handlePrivacyChange('analyticsCookies', enabled)}
                  aria-label={`Toggle ${translations.privacy.cookies.analytics}`}
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>{translations.privacy.cookies.marketing}</h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.cookies.marketingDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={privacySettings.marketingCookies}
                  onChange={enabled => handlePrivacyChange('marketingCookies', enabled)}
                  aria-label={`Toggle ${translations.privacy.cookies.marketing}`}
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>{translations.privacy.twoFactor.title}</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.twoFactor.title}
                  {securitySettings.twoFactorEnabled && (
                    <span className={styles.enabledBadge}>
                      {translations.privacy.twoFactor.enabled}
                    </span>
                  )}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.twoFactor.description}
                </p>
              </div>
              <div className={styles.settingControl}>
                {securitySettings.twoFactorEnabled ? (
                  <button
                    className={styles.actionButtonSmall}
                    onClick={() => handleSecurityChange('twoFactorEnabled', false)}
                  >
                    {translations.privacy.twoFactor.disable}
                  </button>
                ) : (
                  <button className={styles.primaryButton} onClick={handleTwoFactorSetup}>
                    <QrCodeIcon className={styles.buttonIcon} />
                    {translations.privacy.twoFactor.enable}
                  </button>
                )}
              </div>
            </div>

            {securitySettings.twoFactorEnabled && (
              <>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4 className={styles.settingLabel}>
                      {translations.privacy.twoFactor.backupCodes}
                    </h4>
                    <p className={styles.settingDescription}>
                      {translations.privacy.twoFactor.backupDescription}
                    </p>
                  </div>
                  <div className={styles.settingControl}>
                    <button
                      className={styles.actionButtonSmall}
                      onClick={handleGenerateBackupCodes}
                    >
                      <KeyIcon className={styles.buttonIcon} />
                      {securitySettings.hasBackupCodes
                        ? translations.privacy.twoFactor.regenerate
                        : translations.privacy.twoFactor.generate}
                    </button>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4 className={styles.settingLabel}>
                      {translations.privacy.twoFactor.smsBackup}
                    </h4>
                    <p className={styles.settingDescription}>
                      {translations.privacy.twoFactor.smsDescription}
                    </p>
                  </div>
                  <div className={styles.settingControl}>
                    <Toggle
                      enabled={securitySettings.smsBackup}
                      onChange={enabled => handleSecurityChange('smsBackup', enabled)}
                      aria-label={`Toggle ${translations.privacy.twoFactor.smsBackup}`}
                      size="medium"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account Security */}
          <div className={styles.privacySubsection}>
            <h3 className={styles.subsectionTitle}>{translations.privacy.accountSecurity.title}</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.accountSecurity.loginHistory}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.accountSecurity.loginDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <button className={styles.actionButtonSmall} onClick={handleViewLoginHistory}>
                  <HistoryIcon className={styles.buttonIcon} />
                  {translations.privacy.accountSecurity.viewHistory}
                </button>
              </div>
            </div>

            {/* Recent Login Sessions Preview */}
            <div className={styles.loginSessionsPreview}>
              <h4 className={styles.subsectionTitle}>
                {translations.privacy.accountSecurity.recentSessions}
              </h4>
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
                          <span className={styles.currentSessionBadge}>
                            {translations.privacy.accountSecurity.current}
                          </span>
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
                <h4 className={styles.settingLabel}>
                  {translations.privacy.accountSecurity.activeSessions}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.accountSecurity.activeDescription}
                </p>
              </div>
              <div className={styles.settingControl}>
                <button className={styles.actionButtonSecondary} onClick={handleSignOutAllSessions}>
                  {translations.privacy.accountSecurity.signOutAll}
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
