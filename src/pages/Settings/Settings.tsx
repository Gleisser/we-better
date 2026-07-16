import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsTranslation } from '@/shared/hooks/useTranslation';
import { ChevronDownIcon, SettingsIcon } from '@/shared/components/common/icons';
import ThemeSelector from '@/shared/components/theme/ThemeSelector';
import LanguageSelector from '@/shared/components/i18n/LanguageSelector';
import ProfileSettings from '@/shared/components/user/ProfileSettings';
import PricingModal from '@/shared/components/billing/PricingModal/PricingModal';
import NotificationPreferencesSection from './components/NotificationPreferencesSection';
import { sessionsService } from '@/core/services/sessionsService';
import { accountDataService } from '@/core/services/accountDataService';
import { authService } from '@/core/services/authService';
import { type BillingSummary } from '@/core/services/billingService';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';
import { useBillingStripeActions } from '@/shared/hooks/useBillingStripeActions';
import { usePlanCatalog } from '@/shared/hooks/usePlanCatalog';
import { useSessionsHistory, useSessionsOverview } from '@/shared/hooks/useSessionsOverview';
import styles from './Settings.module.css';

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

  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [isSigningOutSessions, setIsSigningOutSessions] = useState(false);
  const [sessionsActionError, setSessionsActionError] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isNotificationsSectionOpen, setIsNotificationsSectionOpen] = useState(true);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [accountActionError, setAccountActionError] = useState<string | null>(null);
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
  const {
    selectedCycle: selectedBillingCycle,
    setSelectedCycle: setSelectedBillingCycle,
    isActionLoading: isBillingActionLoading,
    actionError: billingActionError,
    openPortalSession,
    managePlan,
    startCheckout,
  } = useBillingStripeActions({
    billingInfo,
    checkoutErrorMessage: t('settings.errors.startCheckout') as string,
    openPortalErrorMessage: t('settings.errors.openBillingPortal') as string,
  });
  const effectiveBillingError = billingActionError || billingSummaryError || planCatalogError;
  const sessionsError = sessionsActionError || sessionsOverviewError || sessionHistoryError;

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

  const handleManagePlan = async (): Promise<void> => {
    await managePlan({
      onFreePlan: () => {
        setIsPricingModalOpen(true);
      },
    });
  };

  // Handle data export
  const handleDataExport = async (): Promise<void> => {
    setIsExportingData(true);
    setAccountActionError(null);
    try {
      const exportBlob = await accountDataService.exportJson();
      const url = URL.createObjectURL(exportBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `we-better-data-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setAccountActionError(t('settings.errors.exportData') as string);
    } finally {
      setIsExportingData(false);
    }
  };

  const openDeleteDialog = (): void => {
    const confirmed = window.confirm(translations.privacy.dataManagement.confirmDelete);
    if (!confirmed || !window.confirm(translations.privacy.dataManagement.finalConfirm)) return;
    setDeletePassword('');
    setAccountActionError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!deletePassword || isDeletingAccount) return;
    setIsDeletingAccount(true);
    setAccountActionError(null);
    try {
      await accountDataService.reauthenticateAndDelete(deletePassword);
      await authService.signOut();
      window.location.assign('/');
    } catch (error) {
      const key =
        error instanceof Error && error.message === 'ACTIVE_SUBSCRIPTION'
          ? 'settings.errors.activeSubscriptionDeletion'
          : error instanceof Error && error.message === 'OAUTH_REAUTHENTICATION_REQUIRED'
            ? 'settings.errors.oauthReauthenticationDeletion'
            : 'settings.errors.deleteAccount';
      setAccountActionError(t(key) as string);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Handle login history view
  const handleViewLoginHistory = async (): Promise<void> => {
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
                    onClick={() => {
                      void handleDataExport();
                    }}
                    disabled={isExportingData}
                  >
                    <DownloadIcon className={styles.buttonIcon} />
                    {isExportingData ? '…' : translations.actions.json}
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
                <button
                  className={styles.dangerButton}
                  onClick={openDeleteDialog}
                  disabled={isDeletingAccount}
                >
                  <TrashIcon className={styles.buttonIcon} />
                  {translations.privacy.dataManagement.deleteAccount}
                </button>
              </div>
            </div>
            {accountActionError && (
              <p className={styles.accountActionError} role="alert">
                {accountActionError}
              </p>
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
          void startCheckout(planCode, cycle);
        }}
        onPortalManage={() => {
          void openPortalSession('manage');
        }}
        isLoading={isPlanCatalogLoading || isBillingLoading}
        isBusy={isBillingActionLoading}
        error={effectiveBillingError}
      />
      {isDeleteDialogOpen && (
        <div className={styles.deleteDialogBackdrop} role="presentation">
          <div
            className={styles.deleteDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <h2 id="delete-account-title">{translations.privacy.dataManagement.deleteAccount}</h2>
            <p>{translations.privacy.dataManagement.finalConfirm}</p>
            <label htmlFor="delete-account-password">
              {t('settings.privacy.dataManagement.passwordPrompt')}
            </label>
            <input
              id="delete-account-password"
              type="password"
              value={deletePassword}
              onChange={event => setDeletePassword(event.target.value)}
              autoComplete="current-password"
              disabled={isDeletingAccount}
            />
            {accountActionError && (
              <p className={styles.accountActionError} role="alert">
                {accountActionError}
              </p>
            )}
            <div className={styles.buttonGroup}>
              <button
                className={styles.actionButtonSmall}
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeletingAccount}
              >
                {translations.actions.cancel}
              </button>
              <button
                className={styles.dangerButton}
                type="button"
                onClick={() => {
                  void handleDeleteAccount();
                }}
                disabled={!deletePassword || isDeletingAccount}
              >
                {isDeletingAccount ? '…' : translations.actions.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
