import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/shared/components/layout/Sidebar/Sidebar';
import HeaderActions from '@/shared/components/layout/Header/HeaderActions';
import { HeaderProvider } from '@/shared/contexts/HeaderContext';
import { MobileNav } from '@/shared/components/navigation/MobileNav/MobileNav';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useTheme, useThemeLoading } from '@/shared/hooks/useTheme';
import styles from './WeBetterApp.module.css';

const WeBetterApp = (): JSX.Element => {
  const { user } = useAuth();
  const { t } = useCommonTranslation();
  const { currentTheme, themeMode } = useTheme();
  const isThemeLoading = useThemeLoading();

  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return t('greetings.goodMorning') as string;
    } else if (hour < 17) {
      return t('greetings.goodAfternoon') as string;
    } else {
      return t('greetings.goodEvening') as string;
    }
  };

  const getUserDisplayName = (): string | null => {
    if (user?.display_name?.trim()) {
      return user.display_name.trim();
    }
    if (user?.full_name?.trim()) {
      return user.full_name.trim();
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      if (emailName && emailName.length > 2 && !/^\d+$/.test(emailName)) {
        return emailName;
      }
    }
    return null;
  };

  const getGreetingParts = (): { greeting: string; userPart: string } => {
    const greeting = getGreeting();
    const displayName = getUserDisplayName();

    if (displayName) {
      return { greeting, userPart: displayName };
    }

    return { greeting, userPart: t('greetings.howAreYou') as string };
  };

  const getToastStyles = (): React.CSSProperties => {
    const isDark =
      currentTheme.mode === 'dark' ||
      (currentTheme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return {
      background: isDark ? '#1A1A1A' : '#FFFFFF',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
      borderRadius: '12px',
      padding: '16px 24px',
      fontSize: '14px',
      maxWidth: '400px',
      boxShadow: isDark ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
    };
  };

  if (isThemeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const greetingParts = getGreetingParts();

  return (
    <HeaderProvider>
      <div
        className="flex min-h-screen text-[var(--theme-text-primary)] transition-[background-color,color,box-shadow] duration-300 motion-reduce:transition-none [background:var(--theme-gradient-background)] data-[theme=light]:[background:linear-gradient(to_bottom_right,#f8f9fa,#f1f3f4,#e9ecef)]"
        data-theme={themeMode}
      >
        <Sidebar />

        <main
          className={`${styles.mainContentOffset} relative ml-0 flex-1 transition-all duration-300 motion-reduce:transition-none md:ml-[240px]`}
        >
          <header
            className={`${styles.headerGlass} relative z-40 border-b border-[var(--theme-border-primary)] shadow-[var(--theme-shadow-medium)] md:sticky md:top-0`}
            data-theme={themeMode}
          >
            <div className="mx-auto flex max-w-[1920px] items-center justify-between px-4 py-4 md:px-8 md:py-6">
              <h1 className="font-plus-jakarta text-lg text-[var(--theme-text-primary)] transition-colors duration-300 motion-reduce:transition-none md:text-2xl">
                {greetingParts.greeting},{' '}
                <span className={`${styles.userName} font-bold`}>{greetingParts.userPart}</span>
              </h1>

              <div className="flex items-center gap-6">
                <HeaderActions />
              </div>
            </div>
          </header>

          <div
            className="relative overflow-hidden p-4 pb-20 transition-[background-color,border-color,color,box-shadow] duration-300 motion-reduce:transition-none md:p-8 data-[theme=light]:[background:linear-gradient(135deg,rgba(248,249,250,0.6),rgba(241,243,244,0.8))]"
            data-theme={themeMode}
          >
            <div className={styles.contentBackground} aria-hidden="true" />
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </main>

        <Toaster
          position="top-right"
          reverseOrder={false}
          containerStyle={{
            top: 100,
            right: 20,
          }}
          toastOptions={{
            duration: 4000,
            style: getToastStyles(),
          }}
        />

        <MobileNav />
      </div>
    </HeaderProvider>
  );
};

export default WeBetterApp;
