import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HeaderActions from './HeaderActions';

const mockUseNotificationsFeed = vi.fn();
const mockUseUserPreferences = vi.fn();
const mockUseHeader = vi.fn();

vi.mock('@/shared/hooks/useHeader', () => ({
  useHeader: () => mockUseHeader(),
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useCommonTranslation: () => ({
    t: (key: string): string =>
      (
        ({
          'header.user': 'User',
          'header.toggleTheme': 'Toggle theme',
          'header.notifications': 'Notifications',
        }) satisfies Record<string, string>
      )[key] ?? key,
  }),
}));

vi.mock('@/shared/hooks/useTheme', () => ({
  useThemeToggle: () => ({
    currentMode: 'light',
    effectiveTheme: 'light',
    toggleTheme: vi.fn(),
    isDark: false,
  }),
}));

vi.mock('@/shared/hooks/useUserPreferences', () => ({
  useUserPreferences: (...args: unknown[]) => mockUseUserPreferences(...args),
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      email: 'user@example.com',
      display_name: 'Test User',
    },
    unreadNotificationCount: 3,
  }),
}));

vi.mock('@/shared/hooks/useNotificationsFeed', () => ({
  useNotificationsFeed: (...args: unknown[]) => mockUseNotificationsFeed(...args),
  DEFAULT_NOTIFICATIONS_FEED_PAGE_SIZE: 8,
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/some-path' }),
}));

vi.mock('@/shared/components/layout/NotificationsPopup/NotificationsPopup', () => ({
  default: () => <div data-testid="notifications-popup" />,
}));

vi.mock('@/shared/components/layout/NotificationsPanel/MobileNotifications', () => ({
  MobileNotifications: () => <div data-testid="mobile-notifications" />,
}));

vi.mock('./ProfileMenu/ProfileMenu', () => ({
  default: () => <div data-testid="profile-menu" />,
}));

vi.mock('@/shared/components/i18n/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher" />,
}));

describe('HeaderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHeader.mockReturnValue({
      activePopup: null,
      setActivePopup: vi.fn(),
    });
    mockUseUserPreferences.mockReturnValue({
      updateThemeMode: vi.fn(),
      isLoading: false,
    });
    mockUseNotificationsFeed.mockReturnValue({
      notifications: [],
      isLoading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });
  });

  it('keeps feed loading disabled while the notifications popup is closed and uses mutation-only preferences', () => {
    render(<HeaderActions />);

    expect(mockUseUserPreferences).toHaveBeenCalledWith({ loadOnMount: false });
    expect(mockUseNotificationsFeed).toHaveBeenCalledWith({
      pageSize: 8,
      enabled: false,
    });
  });

  it('enables the notifications feed only when the popup is open', () => {
    mockUseHeader.mockReturnValue({
      activePopup: 'notifications',
      setActivePopup: vi.fn(),
    });

    render(<HeaderActions />);

    expect(mockUseNotificationsFeed).toHaveBeenCalledWith({
      pageSize: 8,
      enabled: true,
    });
  });
});
