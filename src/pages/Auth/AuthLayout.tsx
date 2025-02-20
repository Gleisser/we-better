import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import styles from './Login.module.css';

const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ x: '50%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-50%', opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={styles.loginCard}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout; 