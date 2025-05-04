import { lazy, Suspense } from 'react';

// Lazy load the Testimonies component
const TestimoniesComponent = lazy(() => import('./Testimonies'));

// Loading component
const LoadingTestimonies = (): JSX.Element => (
  <div className="min-h-[500px] flex items-center justify-center bg-black">
    <div className="text-white/50">Loading testimonies...</div>
  </div>
);

export const Testimonies = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingTestimonies />}>
      <TestimoniesComponent />
    </Suspense>
  );
};

export default Testimonies;
