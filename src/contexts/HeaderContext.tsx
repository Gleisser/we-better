import { createContext, useContext, useState, ReactNode } from 'react';

type PopupType = 'profile' | 'notifications' | null;

interface HeaderContextType {
  activePopup: PopupType;
  setActivePopup: (popup: PopupType) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [activePopup, setActivePopup] = useState<PopupType>(null);

  return (
    <HeaderContext.Provider value={{ activePopup, setActivePopup }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}; 