import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import HeaderActions from '@/components/layout/Header/HeaderActions';
import SearchBar from '@/components/layout/SearchBar/SearchBar';
import styles from './WeBetterApp.module.css';

const WeBetterApp = () => {
  return (
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
    </div>
  );
};

export default WeBetterApp; 