import { useContext } from 'react';
import { BottomSheetContext, BottomSheetContextType } from '../contexts/BottomSheetContext';

/**
 * Custom hook to access and manage bottom sheet state.
 * Must be used within a BottomSheetProvider component.
 *
 * @returns {BottomSheetContextType} The bottom sheet context value
 * @throws {Error} If used outside of a BottomSheetProvider
 *
 * @example
 * ```tsx
 * function YourComponent() {
 *   const { activeSheet, setActiveSheet, closeSheet } = useBottomSheet();
 *
 *   return (
 *     <div>
 *       <button onClick={() => setActiveSheet('stories')}>
 *         Open Stories
 *       </button>
 *       <button onClick={() => setActiveSheet('aiChat')}>
 *         Open AI Chat
 *       </button>
 *       <button onClick={closeSheet}>
 *         Close Sheet
 *       </button>
 *       {activeSheet && <div>Current sheet: {activeSheet}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBottomSheet(): BottomSheetContextType {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
}
