import { useContext } from 'react';
import { HeaderContext, HeaderContextType } from '../contexts/HeaderContext';

/**
 * Custom hook to access and manage header popup state.
 * Must be used within a HeaderProvider component.
 *
 * @returns {HeaderContextType} The header context value containing active popup state and setter
 * @throws {Error} If used outside of a HeaderProvider
 *
 * @example
 * ```tsx
 * function HeaderComponent() {
 *   const { activePopup, setActivePopup } = useHeader();
 *
 *   return (
 *     <header>
 *       <button onClick={() => setActivePopup('profile')}>
 *         Profile
 *       </button>
 *       <button onClick={() => setActivePopup('notifications')}>
 *         Notifications
 *       </button>
 *       {activePopup === 'profile' && <ProfilePopup />}
 *       {activePopup === 'notifications' && <NotificationsPopup />}
 *     </header>
 *   );
 * }
 * ```
 */
export const useHeader = (): HeaderContextType => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
