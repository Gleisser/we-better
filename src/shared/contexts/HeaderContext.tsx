import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Defines the available types of header popups in the application.
 * @typedef {('profile' | 'notifications' | null)} PopupType
 * - 'profile' - Popup for user profile options
 * - 'notifications' - Popup for displaying user notifications
 * - null - No popup is currently active
 */
type PopupType = 'profile' | 'notifications' | null;

/**
 * Context interface for managing header popup state.
 * @interface HeaderContextType
 * @property {PopupType} activePopup - Currently active popup or null if none
 * @property {(popup: PopupType) => void} setActivePopup - Function to change the active popup
 */
interface HeaderContextType {
  activePopup: PopupType;
  setActivePopup: (popup: PopupType) => void;
}

/**
 * Context object for managing header popup state across the application.
 * Initialized as undefined to ensure proper provider wrapping.
 */
const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

/**
 * Provider component for header functionality.
 * Manages the state of header popups (profile, notifications) and provides methods to control them.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components that will have access to header context
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <HeaderProvider>
 *       <Header />
 *       <MainContent />
 *     </HeaderProvider>
 *   );
 * }
 * ```
 */
export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [activePopup, setActivePopup] = useState<PopupType>(null);

  return (
    <HeaderContext.Provider value={{ activePopup, setActivePopup }}>
      {children}
    </HeaderContext.Provider>
  );
};

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
export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}; 