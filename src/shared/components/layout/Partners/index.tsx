import { lazy, Suspense } from 'react';

// Lazy load the Partners component
const PartnersComponent = lazy(() => import('./Partners'));

// Loading component
const LoadingPartners = (): JSX.Element => (
  <div className="min-h-[400px] flex items-center justify-center bg-black">
    <div className="text-white/50">Loading partners...</div>
  </div>
);

export const Partners = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingPartners />}>
      <PartnersComponent />
    </Suspense>
  );
};

export default Partners;
