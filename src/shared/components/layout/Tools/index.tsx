import { lazy, Suspense } from 'react';

// Lazy load the Tools component
const ToolsComponent = lazy(() => import('./Tools'));

// Loading component
const LoadingTools = (): JSX.Element => (
  <div className="min-h-[600px] flex items-center justify-center bg-black">
    <div className="text-white/50">Loading tools...</div>
  </div>
);

export const Tools = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingTools />}>
      <ToolsComponent />
    </Suspense>
  );
};

export default Tools;
