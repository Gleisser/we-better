import { lazy, Suspense } from 'react';

// Lazy load the Gallery component
const GalleryComponent = lazy(() => import('./Gallery'));

// Loading component
const LoadingGallery = (): JSX.Element => (
  <div className="min-h-[400px] flex items-center justify-center bg-black">
    <div className="text-white/50">Loading gallery...</div>
  </div>
);

export const Gallery = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingGallery />}>
      <GalleryComponent />
    </Suspense>
  );
};

export default Gallery;
