import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/shared/components/layout/Sidebar/Sidebar';
import HeaderActions from '@/shared/components/layout/Header/HeaderActions';
import { HeaderProvider } from '@/shared/contexts/HeaderContext';
import { MobileNav } from '@/shared/components/navigation/MobileNav/MobileNav';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './WeBetterApp.module.css';

const WeBetterApp = (): JSX.Element => {
  const { user } = useAuth();
  const { t } = useCommonTranslation();

  // Function to get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return t('greetings.goodMorning');
    } else if (hour < 17) {
      return t('greetings.goodAfternoon');
    } else {
      return t('greetings.goodEvening');
    }
  };

  // Get user's display name with fallback
  const getUserDisplayName = (): string | null => {
    if (user?.display_name?.trim()) {
      return user.display_name.trim();
    }
    if (user?.full_name?.trim()) {
      return user.full_name.trim();
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Only use email name if it's not just numbers/generic
      if (emailName && emailName.length > 2 && !/^\d+$/.test(emailName)) {
        return emailName;
      }
    }
    return null;
  };

  // Get the greeting message parts
  const getGreetingParts = (): { greeting: string; userPart: string } => {
    const greeting = getGreeting();
    const displayName = getUserDisplayName();

    if (displayName) {
      return { greeting, userPart: displayName };
    } else {
      return { greeting, userPart: t('greetings.howAreYou') };
    }
  };

  // Check if we're in development mode
  // const isDev = process.env.NODE_ENV === 'development';

  return (
    <HeaderProvider>
      {/* Only include debug tools in development */}
      {/* {isDev && <RepaintDetector />} */}

      <div className={styles.appContainer}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Header Section */}
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.greeting}>
                {getGreetingParts().greeting},{' '}
                <span className={styles.userName}>{getGreetingParts().userPart}</span>
              </h1>

              <div className={styles.headerRight}>
                <HeaderActions />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className={styles.contentArea}>
            <Outlet />
          </div>
        </main>

        {/* Toast Container */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          containerStyle={{
            top: 100, // Position below the header
            right: 20,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '14px',
              maxWidth: '400px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            },
          }}
        />

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </HeaderProvider>
  );
};

export default WeBetterApp;
