import { createContext, useContext, useState, ReactNode } from 'react';

type BottomSheetType = 'stories' | 'aiChat' | null;

interface BottomSheetContextType {
  activeSheet: BottomSheetType;
  setActiveSheet: (sheet: BottomSheetType) => void;
  closeSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null);

  const closeSheet = () => setActiveSheet(null);

  return (
    <BottomSheetContext.Provider value={{ activeSheet, setActiveSheet, closeSheet }}>
      {children}
    </BottomSheetContext.Provider>
  );
}

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
} 