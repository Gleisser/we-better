import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props interface for the Portal component.
 * @interface PortalProps
 * @property {React.ReactNode} children - The content to be rendered in the portal
 */
interface PortalProps {
  children: React.ReactNode;
}

/**
 * A Portal component that renders its children into a DOM node that exists outside
 * the DOM hierarchy of the parent component.
 *
 * Features:
 * - Server-side rendering safe with mounting state
 * - Fallback to document.body if portal-root is not found
 * - Automatic cleanup on unmount
 * - Preserves React context
 *
 * The component will first try to render into an element with id 'portal-root'.
 * If not found, it falls back to document.body.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render in the portal
 *
 * @example
 * ```tsx
 * // First, ensure you have a portal root in your HTML:
 * // <div id="portal-root"></div>
 *
 * function Modal() {
 *   return (
 *     <Portal>
 *       <div className="modal">
 *         <h2>Modal Content</h2>
 *         <p>This renders outside the main app hierarchy.</p>
 *       </div>
 *     </Portal>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using with a loading overlay
 * function LoadingOverlay() {
 *   return (
 *     <Portal>
 *       <div className="overlay">
 *         <Spinner />
 *       </div>
 *     </Portal>
 *   );
 * }
 * ```
 */
export const Portal = ({ children }: PortalProps): JSX.Element | null => {
  /**
   * State to track if the component has mounted.
   * This ensures the portal is only created client-side, preventing SSR issues.
   */
  const [mounted, setMounted] = useState(false);

  /**
   * Effect to handle mounting state.
   * Sets mounted to true on component mount and cleans up on unmount.
   */
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(children, document.getElementById('portal-root') || document.body)
    : null;
};
