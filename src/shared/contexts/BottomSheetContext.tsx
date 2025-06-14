import { createContext, useState, ReactNode } from 'react';

/**
 * Defines the available types of bottom sheets in the application.
 * @typedef {('stories' | 'aiChat' | null)} BottomSheetType
 * - 'stories' - Sheet for displaying user stories
 * - 'aiChat' - Sheet for AI chat interface
 * - null - No sheet is currently active
 */
export type BottomSheetType = 'stories' | 'aiChat' | null;

/**
 * Context interface for managing bottom sheet state and actions.
 * @interface BottomSheetContextType
 * @property {BottomSheetType} activeSheet - Currently active bottom sheet or null if none
 * @property {(sheet: BottomSheetType) => void} setActiveSheet - Function to change the active sheet
 * @property {() => void} closeSheet - Convenience function to close the active sheet
 */
export interface BottomSheetContextType {
  activeSheet: BottomSheetType;
  setActiveSheet: (sheet: BottomSheetType) => void;
  closeSheet: () => void;
}

/**
 * Context object for managing bottom sheet state across the application.
 * Initialized as undefined to ensure proper provider wrapping.
 */
export const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

/**
 * Provider component for bottom sheet functionality.
 * Manages the state of bottom sheets and provides methods to control them.
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components that will have access to bottom sheet context
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <BottomSheetProvider>
 *       <YourApp />
 *     </BottomSheetProvider>
 *   );
 * }
 * ```
 */
export function BottomSheetProvider({ children }: { children: ReactNode }): React.ReactNode {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null);

  /**
   * Closes the currently active bottom sheet.
   * Sets the activeSheet state to null.
   */
  const closeSheet = (): void => setActiveSheet(null);

  return (
    <BottomSheetContext.Provider value={{ activeSheet, setActiveSheet, closeSheet }}>
      {children}
    </BottomSheetContext.Provider>
  );
}
