import { lazy, Suspense } from 'react';

// Lazy load the Community component
const CommunityComponent = lazy(() => import('./Community'));

// Loading component
const LoadingCommunity = () => (
  <div className="min-h-[600px] flex items-center justify-center bg-black">
    <div className="text-white/50">Loading community...</div>
  </div>
);

export const Community = () => {
  return (
    <Suspense fallback={<LoadingCommunity />}>
      <CommunityComponent />
    </Suspense>
  );
};

export default Community; 