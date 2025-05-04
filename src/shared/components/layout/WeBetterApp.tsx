import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/shared/components/layout/Sidebar/Sidebar';
import HeaderActions from '@/shared/components/layout/Header/HeaderActions';
import SearchBar from '@/shared/components/layout/SearchBar/SearchBar';
import { HeaderProvider } from '@/shared/contexts/HeaderContext';
import { MobileNav } from '@/shared/components/navigation/MobileNav/MobileNav';
import styles from './WeBetterApp.module.css';

const WeBetterApp = (): JSX.Element => {
  return (
    <HeaderProvider>
      <div className={styles.appContainer}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Header Section */}
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.greeting}>
                Good Morning, <span className={styles.userName}>Gleisser</span>
              </h1>

              <div className={styles.headerRight}>
                <SearchBar />
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
