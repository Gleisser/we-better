import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsTranslation } from '@/shared/hooks/useTranslation';
import { ChevronDownIcon, SettingsIcon } from '@/shared/components/common/icons';
import ThemeSelector from '@/shared/components/theme/ThemeSelector';
import LanguageSelector from '@/shared/components/i18n/LanguageSelector';
import ProfileSettings from '@/shared/components/user/ProfileSettings';
import Toggle from '@/shared/components/common/Toggle';
import PricingModal from '@/shared/components/billing/PricingModal/PricingModal';
import NotificationPreferencesSection from './components/NotificationPreferencesSection';
import { sessionsService } from '@/core/services/sessionsService';
import {
  billingService,
  type BillingSummary,
  type PlanCode,
  type BillingCycle,
  type PortalFlow,
} from '@/core/services/billingService';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';
import { usePlanCatalog } from '@/shared/hooks/usePlanCatalog';
import { useSessionsHistory, useSessionsOverview } from '@/shared/hooks/useSessionsOverview';
import styles from './Settings.module.css';

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
  const { t, currentLanguage } = useSettingsTranslation();

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
        unavailable: t('settings.billing.unavailable') as string,
        loadingSummary: t('settings.billing.loadingSummary') as string,
        noPaymentMethod: t('settings.billing.noPaymentMethod') as string,
        freePlanPrice: t('settings.billing.freePlanPrice') as string,
        cancelAtPeriodEnd: t('settings.billing.cancelAtPeriodEnd') as string,
        processing: t('settings.billing.processing') as string,
        currentUsage: t('settings.billing.currentUsage') as string,
        viewBillingHistory: t('settings.billing.viewBillingHistory') as string,
        downloadInvoice: t('settings.billing.downloadInvoice') as string,
        cancelSubscription: t('settings.billing.cancelSubscription') as string,
        seeAllPlans: t('settings.billing.seeAllPlans') as string,
        usage: {
          goals: t('settings.billing.usage.goals') as string,
          habits: t('settings.billing.usage.habits') as string,
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

  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [isSigningOutSessions, setIsSigningOutSessions] = useState(false);
  const [sessionsActionError, setSessionsActionError] = useState<string | null>(null);
  const [isBillingActionLoading, setIsBillingActionLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>('monthly');
  const [isNotificationsSectionOpen, setIsNotificationsSectionOpen] = useState(true);
  const {
    data: billingInfo,
    error: billingSummaryError,
    isLoading: isBillingLoading,
  } = useBillingSummary();
  const {
    summary: sessionSummary,
    recentSessions,
    error: sessionsOverviewError,
    isLoading: isSessionsLoading,
    refetch: refetchSessionsOverview,
  } = useSessionsOverview();
  const {
    sessions: sessionHistory,
    error: sessionHistoryError,
    isLoading: isHistoryLoading,
    refetch: refetchSessionHistory,
  } = useSessionsHistory({
    limit: 50,
    offset: 0,
    enabled: showLoginHistory,
  });
  const {
    plans: planCatalog,
    error: planCatalogError,
    isLoading: isPlanCatalogLoading,
  } = usePlanCatalog();
  const effectiveBillingError = billingError || billingSummaryError || planCatalogError;
  const sessionsError = sessionsActionError || sessionsOverviewError || sessionHistoryError;

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

    if (diffInHours < 1) return translations.privacy.accountSecurity.timeAgo.justNow;
    if (diffInHours < 24)
      return translations.privacy.accountSecurity.timeAgo.hoursAgo.replace(
        '{{count}}',
        diffInHours.toString()
      );
    if (diffInHours < 48) return translations.privacy.accountSecurity.timeAgo.yesterday;
    return date.toLocaleDateString(currentLanguage === 'pt' ? 'pt-BR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    if (billingInfo?.billingCycle) {
      setSelectedBillingCycle(billingInfo.billingCycle);
    }
  }, [billingInfo?.billingCycle]);

  const buildReturnUrl = (): string => {
    return window.location.href;
  };

  const openPortalSession = async (flow: PortalFlow): Promise<void> => {
    setIsBillingActionLoading(true);
    setBillingError(null);

    const { data, error } = await billingService.createPortalSession(flow, buildReturnUrl());
    if (error || !data?.url) {
      setBillingError(error || (t('settings.errors.openBillingPortal') as string));
      setIsBillingActionLoading(false);
      return;
    }

    window.location.assign(data.url);
  };

  const handleManagePlan = async (): Promise<void> => {
    if (!billingInfo) {
      return;
    }

    if (billingInfo.currentPlan === 'free') {
      setIsPricingModalOpen(true);
      return;
    }

    await openPortalSession('manage');
  };

  const handlePricingCheckout = async (
    planCode: Exclude<PlanCode, 'free'>,
    cycle: BillingCycle
  ): Promise<void> => {
    setIsBillingActionLoading(true);
    setBillingError(null);

    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set('billing', 'success');
    const cancelUrl = new URL(window.location.href);
    cancelUrl.searchParams.set('billing', 'cancel');

    const { data, error } = await billingService.createCheckoutSession(
      planCode,
      cycle,
      successUrl.toString(),
      cancelUrl.toString()
    );

    if (error || !data?.url) {
      setBillingError(error || (t('settings.errors.startCheckout') as string));
      setIsBillingActionLoading(false);
      return;
    }

    window.location.assign(data.url);
  };

  // Handle data export
  const handleDataExport = (format: 'json' | 'csv'): void => {
    console.info(`Exporting data in ${format} format`);
    // TODO: Implement actual data export
  };

  // Handle account deletion
  const handleDeleteAccount = (): void => {
    const confirmed = window.confirm(translations.privacy.dataManagement.confirmDelete);
    if (confirmed) {
      const finalConfirm = window.confirm(translations.privacy.dataManagement.finalConfirm);
      if (finalConfirm) {
        console.info(translations.privacy.dataManagement.deletionInitiated);
        // TODO: Implement actual account deletion
      }
    }
  };

  // Handle 2FA setup
  const handleTwoFactorSetup = (): void => {
    console.info(translations.privacy.twoFactor.setupModal);
    // TODO: Open 2FA setup modal
  };

  // Handle backup codes generation
  const handleGenerateBackupCodes = (): void => {
    console.info(translations.privacy.twoFactor.generatingCodes);
    setSecuritySettings(prev => ({ ...prev, hasBackupCodes: true }));
    // TODO: Generate and show backup codes
  };

  // Handle login history view
  const handleViewLoginHistory = async (): Promise<void> => {
    console.info(translations.privacy.accountSecurity.viewingHistory);

    const nextVisible = !showLoginHistory;
    setShowLoginHistory(nextVisible);
  };

  // Handle sign out all sessions
  const handleSignOutAllSessions = async (): Promise<void> => {
    const confirmed = window.confirm(translations.privacy.accountSecurity.signOutConfirm);
    if (!confirmed) {
      return;
    }

    setIsSigningOutSessions(true);
    console.info(translations.privacy.accountSecurity.signingOutSessions);

    const { data, error } = await sessionsService.logoutOtherSessions();

    if (error || !data?.success) {
      setSessionsActionError(error || (t('settings.errors.signOutOtherSessions') as string));
      setIsSigningOutSessions(false);
      return;
    }

    if (data.warning) {
      console.warn('Logout other sessions warning:', data.warning);
    }

    setSessionsActionError(null);
    await refetchSessionsOverview();
    if (showLoginHistory) {
      await refetchSessionHistory();
    }

    setIsSigningOutSessions(false);
  };

  const handleUpdatePaymentMethod = async (): Promise<void> => {
    await openPortalSession('payment_method_update');
  };

  const handleViewBillingHistory = async (): Promise<void> => {
    await openPortalSession('history');
  };

  const handleDownloadInvoice = async (): Promise<void> => {
    await openPortalSession('history');
  };

  const handleCancelSubscription = async (): Promise<void> => {
    await openPortalSession('cancel');
  };

  // Get plan display information
  const getPlanInfo = (
    plan: BillingSummary['currentPlan']
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
        return {
          name: t('settings.billing.plans.unknown') as string,
          color: '#6b7280',
          icon: '❓',
        };
    }
  };

  const planInfo = billingInfo ? getPlanInfo(billingInfo.currentPlan) : null;

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate usage percentage
  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit <= 0) return 0;
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

      <div className={styles.content}>
        <ProfileSettings className={styles.profileSettings} />

        {/* Plans & Billing Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeadingRow}>
            <div>
              <h2 className={styles.sectionTitle}>{translations.sections.plansAndBilling}</h2>
              <p className={styles.sectionDescription}>
                {translations.descriptions.plansAndBilling}
              </p>
            </div>
            <Link className={styles.seePlansLink} to="/app/pricing">
              {translations.billing.seeAllPlans}
            </Link>
          </div>

          {effectiveBillingError && (
            <p className={styles.billingErrorText}>{effectiveBillingError}</p>
          )}

          {isBillingLoading && (
            <div className={styles.billingCard}>
              <p className={styles.billingStatusText}>{translations.billing.loadingSummary}</p>
            </div>
          )}

          {!isBillingLoading && !billingInfo && (
            <div className={styles.billingCard}>
              <p className={styles.billingStatusText}>{translations.billing.unavailable}</p>
            </div>
          )}

          {!isBillingLoading && billingInfo && planInfo && (
            <div className={styles.billingCard}>
              <div className={styles.planHeader}>
                <div className={styles.planInfo}>
                  <div className={styles.planIcon} style={{ backgroundColor: planInfo.color }}>
                    <CrownIcon className={styles.planIconSvg} />
                  </div>
                  <div>
                    <h3 className={styles.planName}>{planInfo.name}</h3>
                    <p className={styles.planPrice}>
                      {billingInfo.billingCycle
                        ? `$${billingInfo.amount.toFixed(2)}/${
                            billingInfo.billingCycle === 'monthly'
                              ? translations.billing.billing.monthly
                              : translations.billing.billing.yearly
                          }`
                        : translations.billing.freePlanPrice}
                    </p>
                  </div>
                </div>
                <button
                  className={styles.managePlanButton}
                  onClick={() => {
                    void handleManagePlan();
                  }}
                  disabled={isBillingActionLoading}
                >
                  {isBillingActionLoading
                    ? translations.billing.processing
                    : translations.billing.managePlan}
                </button>
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
                    <span className={styles.billingLabel}>
                      {translations.billing.paymentMethod}
                    </span>
                    <span className={styles.billingValue}>
                      {billingInfo.paymentMethod.type === 'card'
                        ? `${billingInfo.paymentMethod.brand || (t('settings.billing.cardFallback') as string)} ••••${billingInfo.paymentMethod.lastFour || ''}`
                        : translations.billing.noPaymentMethod}
                    </span>
                  </div>
                  <button
                    className={styles.updateButton}
                    onClick={() => {
                      void handleUpdatePaymentMethod();
                    }}
                    disabled={isBillingActionLoading || billingInfo.currentPlan === 'free'}
                  >
                    {translations.billing.update}
                  </button>
                </div>
              </div>

              {billingInfo.cancelAtPeriodEnd && (
                <p className={styles.billingStatusText}>{translations.billing.cancelAtPeriodEnd}</p>
              )}

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
                          width: `${getUsagePercentage(
                            billingInfo.usage.goalsUsed,
                            billingInfo.usage.goalsLimit
                          )}%`,
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
                          width: `${getUsagePercentage(
                            billingInfo.usage.habitsUsed,
                            billingInfo.usage.habitsLimit
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.billingActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    void handleViewBillingHistory();
                  }}
                  disabled={isBillingActionLoading}
                >
                  {translations.billing.viewBillingHistory}
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    void handleDownloadInvoice();
                  }}
                  disabled={isBillingActionLoading}
                >
                  {translations.billing.downloadInvoice}
                </button>
                <button
                  className={styles.actionButtonSecondary}
                  onClick={() => {
                    void handleCancelSubscription();
                  }}
                  disabled={isBillingActionLoading || billingInfo.currentPlan === 'free'}
                >
                  {translations.billing.cancelSubscription}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{translations.sections.general}</h2>
          <p className={styles.sectionDescription}>{translations.descriptions.general}</p>

          <ThemeSelector className={styles.themeSelector} />

          <LanguageSelector className={styles.languageSelector} />
        </div>

        <div className={styles.section}>
          <button
            type="button"
            className={styles.collapsibleTrigger}
            onClick={() => {
              setIsNotificationsSectionOpen(previous => !previous);
            }}
            aria-expanded={isNotificationsSectionOpen}
            aria-controls="notifications-settings-content"
          >
            <div className={styles.collapsibleHeading}>
              <h2 className={styles.sectionTitle}>{translations.sections.notifications}</h2>
              <p className={styles.sectionDescription}>{translations.descriptions.notifications}</p>
            </div>
            <ChevronDownIcon
              className={`${styles.collapsibleIcon} ${
                isNotificationsSectionOpen ? styles.collapsibleIconOpen : ''
              }`}
            />
          </button>

          {isNotificationsSectionOpen && (
            <div id="notifications-settings-content" className={styles.collapsibleContent}>
              <NotificationPreferencesSection />
            </div>
          )}
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
                <button
                  className={styles.actionButtonSmall}
                  onClick={() => {
                    void handleViewLoginHistory();
                  }}
                >
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
                {isSessionsLoading && (
                  <div className={styles.loginSessionItem}>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionHeader}>
                        <span className={styles.sessionDevice}>Loading sessions...</span>
                      </div>
                    </div>
                  </div>
                )}
                {!isSessionsLoading &&
                  recentSessions.slice(0, 3).map(session => (
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
                {!isSessionsLoading && recentSessions.length === 0 && (
                  <div className={styles.loginSessionItem}>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionHeader}>
                        <span className={styles.sessionDevice}>No recent sessions found</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showLoginHistory && (
              <div className={styles.loginSessionsPreview}>
                <h4 className={styles.subsectionTitle}>
                  {translations.privacy.accountSecurity.loginHistory}
                </h4>
                <div className={styles.loginSessionsList}>
                  {isHistoryLoading && (
                    <div className={styles.loginSessionItem}>
                      <div className={styles.sessionInfo}>
                        <div className={styles.sessionHeader}>
                          <span className={styles.sessionDevice}>Loading history...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isHistoryLoading &&
                    sessionHistory.map(session => (
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
                  {!isHistoryLoading && sessionHistory.length === 0 && (
                    <div className={styles.loginSessionItem}>
                      <div className={styles.sessionInfo}>
                        <div className={styles.sessionHeader}>
                          <span className={styles.sessionDevice}>No login history found</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>
                  {translations.privacy.accountSecurity.activeSessions}
                </h4>
                <p className={styles.settingDescription}>
                  {translations.privacy.accountSecurity.activeDescription} (
                  {sessionSummary.activeSessions})
                </p>
              </div>
              <div className={styles.settingControl}>
                <button
                  className={styles.actionButtonSecondary}
                  onClick={() => {
                    void handleSignOutAllSessions();
                  }}
                  disabled={isSigningOutSessions}
                >
                  {translations.privacy.accountSecurity.signOutAll}
                </button>
              </div>
            </div>
            {sessionsError && (
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <p className={styles.settingDescription}>{sessionsError}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        plans={planCatalog}
        billingInfo={billingInfo}
        selectedCycle={selectedBillingCycle}
        onCycleChange={setSelectedBillingCycle}
        onCheckout={(planCode, cycle) => {
          void handlePricingCheckout(planCode, cycle);
        }}
        onPortalManage={() => {
          void openPortalSession('manage');
        }}
        isLoading={isPlanCatalogLoading || isBillingLoading}
        isBusy={isBillingActionLoading}
        error={effectiveBillingError}
      />
    </div>
  );
};

export default Settings;
