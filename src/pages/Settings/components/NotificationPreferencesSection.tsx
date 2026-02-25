import { type ReactNode, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@/shared/components/common/icons';
import Toggle from '@/shared/components/common/Toggle';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useNotificationSettings } from '@/shared/hooks/useNotificationSettings';
import { pushSubscriptionService } from '@/core/services/pushSubscriptionService';
import type { NotificationSettingsDto } from '@/core/services/notificationSettingsService';
import styles from '../Settings.module.css';

interface ToggleConfig {
  key: keyof NotificationSettingsDto;
  label: string;
  description: string;
}

type NotificationSubsectionKey = 'master' | 'reminders' | 'achievements' | 'schedule';

const normalizeTimeForInput = (value: string): string => {
  if (!value) return '00:00';
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const normalizeTimeForApi = (value: string): string => {
  if (!value) return '00:00:00';
  return value.length === 5 ? `${value}:00` : value;
};

const NotificationPreferencesSection = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const { settings, isLoading, isSaving, error, updateSettings } = useNotificationSettings();
  const [pushPermissionError, setPushPermissionError] = useState<string | null>(null);
  const [openSubsections, setOpenSubsections] = useState<
    Record<NotificationSubsectionKey, boolean>
  >({
    master: true,
    reminders: true,
    achievements: true,
    schedule: true,
  });

  const timezoneOptions = useMemo(() => {
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const curated = [
      'UTC',
      localTimezone,
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Lisbon',
    ];
    return Array.from(new Set(curated));
  }, []);

  const masterToggles = useMemo<ToggleConfig[]>(
    () => [
      {
        key: 'email_notifications',
        label: t('settings.notificationsV1.master.email') as string,
        description: t('settings.notificationsV1.master.emailDescription') as string,
      },
      {
        key: 'push_notifications',
        label: t('settings.notificationsV1.master.push') as string,
        description: t('settings.notificationsV1.master.pushDescription') as string,
      },
      {
        key: 'in_app_notifications',
        label: t('settings.notificationsV1.master.inApp') as string,
        description: t('settings.notificationsV1.master.inAppDescription') as string,
      },
    ],
    [t]
  );

  const reminderToggles = useMemo<ToggleConfig[]>(
    () => [
      {
        key: 'email_habits_reminders',
        label: t('settings.notificationsV1.events.habitsEmail') as string,
        description: t('settings.notificationsV1.events.habitsEmailDescription') as string,
      },
      {
        key: 'push_habits_reminders',
        label: t('settings.notificationsV1.events.habitsPush') as string,
        description: t('settings.notificationsV1.events.habitsPushDescription') as string,
      },
      {
        key: 'email_goals_reminders',
        label: t('settings.notificationsV1.events.goalsEmail') as string,
        description: t('settings.notificationsV1.events.goalsEmailDescription') as string,
      },
      {
        key: 'push_goals_reminders',
        label: t('settings.notificationsV1.events.goalsPush') as string,
        description: t('settings.notificationsV1.events.goalsPushDescription') as string,
      },
      {
        key: 'email_dream_challenge_reminders',
        label: t('settings.notificationsV1.events.dreamChallengesEmail') as string,
        description: t('settings.notificationsV1.events.dreamChallengesEmailDescription') as string,
      },
      {
        key: 'push_dream_challenge_reminders',
        label: t('settings.notificationsV1.events.dreamChallengesPush') as string,
        description: t('settings.notificationsV1.events.dreamChallengesPushDescription') as string,
      },
      {
        key: 'push_daily_affirmations',
        label: t('settings.notificationsV1.events.affirmationsPush') as string,
        description: t('settings.notificationsV1.events.affirmationsPushDescription') as string,
      },
    ],
    [t]
  );

  const achievementToggles = useMemo<ToggleConfig[]>(
    () => [
      {
        key: 'email_habit_streak_achievements',
        label: t('settings.notificationsV1.events.habitStreakEmail') as string,
        description: t('settings.notificationsV1.events.habitStreakEmailDescription') as string,
      },
      {
        key: 'push_habit_streak_achievements',
        label: t('settings.notificationsV1.events.habitStreakPush') as string,
        description: t('settings.notificationsV1.events.habitStreakPushDescription') as string,
      },
      {
        key: 'email_milestone_achievements',
        label: t('settings.notificationsV1.events.goalMilestonesEmail') as string,
        description: t('settings.notificationsV1.events.goalMilestonesEmailDescription') as string,
      },
      {
        key: 'push_milestone_achievements',
        label: t('settings.notificationsV1.events.goalMilestonesPush') as string,
        description: t('settings.notificationsV1.events.goalMilestonesPushDescription') as string,
      },
      {
        key: 'email_weekly_insights',
        label: t('settings.notificationsV1.events.weeklySummaryEmail') as string,
        description: t('settings.notificationsV1.events.weeklySummaryEmailDescription') as string,
      },
    ],
    [t]
  );

  const subsectionTitles = useMemo<Record<NotificationSubsectionKey, string>>(
    () => ({
      master: t('settings.notificationsV1.master.title') as string,
      reminders: t('settings.notificationsV1.reminders.title') as string,
      achievements: t('settings.notificationsV1.achievements.title') as string,
      schedule: t('settings.notificationsV1.schedule.title') as string,
    }),
    [t]
  );

  const toggleSubsection = (key: NotificationSubsectionKey): void => {
    setOpenSubsections(previous => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const renderSubsection = (
    key: NotificationSubsectionKey,
    content: ReactNode,
    titleTag: 'h3' | 'h4' = 'h3'
  ): JSX.Element => {
    const isOpen = openSubsections[key];
    const contentId = `notification-subsection-${key}`;
    const TitleTag = titleTag;

    return (
      <div className={styles.privacySubsection}>
        <button
          type="button"
          className={styles.subsectionCollapsibleTrigger}
          onClick={() => {
            toggleSubsection(key);
          }}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <TitleTag className={`${styles.subsectionTitle} ${styles.subsectionCollapsibleTitle}`}>
            {subsectionTitles[key]}
          </TitleTag>
          <ChevronDownIcon
            className={`${styles.collapsibleIcon} ${isOpen ? styles.collapsibleIconOpen : ''}`}
          />
        </button>

        {isOpen && (
          <div id={contentId} className={styles.subsectionCollapsibleContent}>
            {content}
          </div>
        )}
      </div>
    );
  };

  const handleToggleUpdate = async (
    key: keyof NotificationSettingsDto,
    enabled: boolean
  ): Promise<void> => {
    setPushPermissionError(null);

    const success = await updateSettings({ [key]: enabled });
    if (!success) {
      return;
    }

    if (key === 'push_notifications') {
      if (enabled) {
        const pushResult = await pushSubscriptionService.subscribeCurrentBrowser();
        if (!pushResult.success) {
          setPushPermissionError(
            pushResult.error || (t('settings.notificationsV1.pushPermissionError') as string)
          );
          await updateSettings({ push_notifications: false });
        }
      } else {
        await pushSubscriptionService.unsubscribeCurrentBrowser();
      }
    }
  };

  const handleTimeUpdate = async (
    key:
      | 'quiet_hours_start'
      | 'quiet_hours_end'
      | 'habit_reminder_time'
      | 'goal_review_reminder_time',
    value: string
  ): Promise<void> => {
    await updateSettings({ [key]: normalizeTimeForApi(value) });
  };

  const handleTimezoneUpdate = async (value: string): Promise<void> => {
    if (!value || value.trim().length === 0) return;
    await updateSettings({ timezone: value.trim() });
  };

  if (isLoading) {
    return <p className={styles.settingDescription}>{t('common.actions.loading') as string}</p>;
  }

  return (
    <>
      {(error || pushPermissionError) && (
        <p className={styles.billingErrorText}>{pushPermissionError || error}</p>
      )}

      {renderSubsection(
        'master',
        <>
          {masterToggles.map(toggle => (
            <div key={toggle.key} className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h3 className={styles.settingLabel}>{toggle.label}</h3>
                <p className={styles.settingDescription}>{toggle.description}</p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={Boolean(settings[toggle.key])}
                  onChange={enabled => {
                    void handleToggleUpdate(toggle.key, enabled);
                  }}
                  disabled={isSaving}
                  aria-label={`Toggle ${toggle.label}`}
                  size="medium"
                />
              </div>
            </div>
          ))}
        </>
      )}

      {renderSubsection(
        'reminders',
        <>
          {reminderToggles.map(toggle => (
            <div key={toggle.key} className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>{toggle.label}</h4>
                <p className={styles.settingDescription}>{toggle.description}</p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={Boolean(settings[toggle.key])}
                  onChange={enabled => {
                    void handleToggleUpdate(toggle.key, enabled);
                  }}
                  disabled={isSaving}
                  aria-label={`Toggle ${toggle.label}`}
                  size="medium"
                />
              </div>
            </div>
          ))}
        </>
      )}

      {renderSubsection(
        'achievements',
        <>
          {achievementToggles.map(toggle => (
            <div key={toggle.key} className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>{toggle.label}</h4>
                <p className={styles.settingDescription}>{toggle.description}</p>
              </div>
              <div className={styles.settingControl}>
                <Toggle
                  enabled={Boolean(settings[toggle.key])}
                  onChange={enabled => {
                    void handleToggleUpdate(toggle.key, enabled);
                  }}
                  disabled={isSaving}
                  aria-label={`Toggle ${toggle.label}`}
                  size="medium"
                />
              </div>
            </div>
          ))}
        </>
      )}

      {renderSubsection(
        'schedule',
        <>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>
                {t('settings.notificationsV1.schedule.timezone') as string}
              </h4>
              <p className={styles.settingDescription}>
                {t('settings.notificationsV1.schedule.timezoneDescription') as string}
              </p>
            </div>
            <div className={styles.settingControl}>
              <input
                list="notification-timezones"
                defaultValue={settings.timezone}
                onBlur={event => {
                  void handleTimezoneUpdate(event.target.value);
                }}
                className={styles.actionButton}
                aria-label={t('settings.notificationsV1.schedule.timezone') as string}
              />
              <datalist id="notification-timezones">
                {timezoneOptions.map(timezone => (
                  <option key={timezone} value={timezone} />
                ))}
              </datalist>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>
                {t('settings.notificationsV1.schedule.quietHoursEnabled') as string}
              </h4>
              <p className={styles.settingDescription}>
                {t('settings.notificationsV1.schedule.quietHoursEnabledDescription') as string}
              </p>
            </div>
            <div className={styles.settingControl}>
              <Toggle
                enabled={settings.quiet_hours_enabled}
                onChange={enabled => {
                  void handleToggleUpdate('quiet_hours_enabled', enabled);
                }}
                disabled={isSaving}
                aria-label={t('settings.notificationsV1.schedule.quietHoursEnabled') as string}
                size="medium"
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>
                {t('settings.notificationsV1.schedule.quietHoursStart') as string}
              </h4>
              <p className={styles.settingDescription}>
                {t('settings.notificationsV1.schedule.quietHoursStartDescription') as string}
              </p>
            </div>
            <div className={styles.settingControl}>
              <input
                type="time"
                defaultValue={normalizeTimeForInput(settings.quiet_hours_start)}
                onBlur={event => {
                  void handleTimeUpdate('quiet_hours_start', event.target.value);
                }}
                className={styles.actionButton}
                aria-label={t('settings.notificationsV1.schedule.quietHoursStart') as string}
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>
                {t('settings.notificationsV1.schedule.quietHoursEnd') as string}
              </h4>
              <p className={styles.settingDescription}>
                {t('settings.notificationsV1.schedule.quietHoursEndDescription') as string}
              </p>
            </div>
            <div className={styles.settingControl}>
              <input
                type="time"
                defaultValue={normalizeTimeForInput(settings.quiet_hours_end)}
                onBlur={event => {
                  void handleTimeUpdate('quiet_hours_end', event.target.value);
                }}
                className={styles.actionButton}
                aria-label={t('settings.notificationsV1.schedule.quietHoursEnd') as string}
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>
                {t('settings.notificationsV1.schedule.habitReminderTime') as string}
              </h4>
              <p className={styles.settingDescription}>
                {t('settings.notificationsV1.schedule.habitReminderTimeDescription') as string}
              </p>
            </div>
            <div className={styles.settingControl}>
              <input
                type="time"
                defaultValue={normalizeTimeForInput(settings.habit_reminder_time)}
                onBlur={event => {
                  void handleTimeUpdate('habit_reminder_time', event.target.value);
                }}
                className={styles.actionButton}
                aria-label={t('settings.notificationsV1.schedule.habitReminderTime') as string}
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>
                {t('settings.notificationsV1.schedule.goalReminderTime') as string}
              </h4>
              <p className={styles.settingDescription}>
                {t('settings.notificationsV1.schedule.goalReminderTimeDescription') as string}
              </p>
            </div>
            <div className={styles.settingControl}>
              <input
                type="time"
                defaultValue={normalizeTimeForInput(settings.goal_review_reminder_time)}
                onBlur={event => {
                  void handleTimeUpdate('goal_review_reminder_time', event.target.value);
                }}
                className={styles.actionButton}
                aria-label={t('settings.notificationsV1.schedule.goalReminderTime') as string}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotificationPreferencesSection;
