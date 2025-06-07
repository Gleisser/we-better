import { lazy, Suspense } from 'react';

// Lazy load the Showcase component
const ShowcaseComponent = lazy(() => import('./Showcase'));

// Loading component
const LoadingShowcase = (): JSX.Element => (
  <div className="min-h-[600px] flex items-center justify-center bg-black">
    <div className="text-white/50">Loading showcase...</div>
  </div>
);

export const Showcase = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingShowcase />}>
      <ShowcaseComponent />
    </Suspense>
  );
};

export default Showcase;
