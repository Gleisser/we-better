type RouteLoaderVariant = 'fullscreen' | 'content';

interface RouteLoaderProps {
  label?: string;
  variant?: RouteLoaderVariant;
}

const variantClassName: Record<RouteLoaderVariant, string> = {
  fullscreen:
    'flex min-h-screen items-center justify-center bg-[var(--theme-surface-primary,#050505)] px-6 py-12 text-center text-sm text-[var(--theme-text-secondary,#d1d5db)]',
  content:
    'flex min-h-[16rem] items-center justify-center rounded-3xl border border-[var(--theme-border-primary,rgba(255,255,255,0.08))] bg-[var(--theme-surface-elevated,rgba(255,255,255,0.04))] px-6 py-10 text-center text-sm text-[var(--theme-text-secondary,#d1d5db)]',
};

export const RouteLoader = ({
  label = 'Loading page...',
  variant = 'fullscreen',
}: RouteLoaderProps): JSX.Element => {
  return (
    <div className={variantClassName[variant]} role="status" aria-live="polite">
      <span>{label}</span>
    </div>
  );
};

export default RouteLoader;
