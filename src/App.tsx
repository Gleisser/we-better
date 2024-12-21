import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';
import { useEffect } from 'react';
import { prefetchHero } from '@/hooks/useHero';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import { Header, Hero, Footer } from './components/layout';
import Features from './components/layout/Features/Features';
import Highlights from './components/layout/Highlights/Highlights';
import { Tools } from './components/layout/Tools';
import { Showcase } from './components/layout/Showcase';
import { Gallery } from './components/layout/Gallery';
import { Community } from './components/layout/Community';
import { Testimonies } from './components/layout/Testimonies';
import { Partners } from './components/layout/Partners';
import PreFooter from './components/layout/PreFooter/PreFooter';
import { FeaturesErrorFallback } from './components/layout/Features/FeaturesErrorFallback';
import { HighlightsErrorFallback } from './components/layout/Highlights/HighlightsErrorFallback';
import { ToolsErrorFallback } from './components/layout/Tools/ToolsErrorFallback';
import { ShowcaseErrorFallback } from './components/layout/Showcase/ShowcaseErrorFallback';
import { GalleryErrorFallback } from './components/layout/Gallery/GalleryErrorFallback';
import { CommunityErrorFallback } from './components/layout/Community/CommunityErrorFallback';
import { TestimoniesErrorFallback } from './components/layout/Testimonies/TestimoniesErrorFallback';
import { PartnersErrorFallback } from './components/layout/Partners/PartnersErrorFallback';

function AppContent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchHero(queryClient);
  }, [queryClient]);

  return (
    <ErrorBoundary section="Application">
      <div className="h-full w-full max-w-[100%] overflow-x-hidden bg-black">
        <ErrorBoundary section="Header">
          <Header />
        </ErrorBoundary>
        
        <main className="w-full max-w-[100%] overflow-x-hidden">
          <ErrorBoundary section="Hero">
            <Hero />
          </ErrorBoundary>
          
          <ErrorBoundary section="Features" fallback={<FeaturesErrorFallback />}>
            <Features />
          </ErrorBoundary>
          
          <ErrorBoundary section="Highlights" fallback={<HighlightsErrorFallback />}>
            <Highlights />
          </ErrorBoundary>
          
          <ErrorBoundary section="Tools" fallback={<ToolsErrorFallback />}>
            <Tools />
          </ErrorBoundary>
          
          <ErrorBoundary section="Showcase" fallback={<ShowcaseErrorFallback />}>
            <Showcase />
          </ErrorBoundary>
          
          <ErrorBoundary section="Gallery" fallback={<GalleryErrorFallback />}>
            <Gallery />
          </ErrorBoundary>
          
          <ErrorBoundary section="Community" fallback={<CommunityErrorFallback />}>
            <Community />
          </ErrorBoundary>
          
          <ErrorBoundary section="Testimonies" fallback={<TestimoniesErrorFallback />}>
            <Testimonies />
          </ErrorBoundary>
          
          <ErrorBoundary section="Partners" fallback={<PartnersErrorFallback />}>
            <Partners />
          </ErrorBoundary>
          
          <ErrorBoundary section="Pre-Footer">
            <PreFooter />
          </ErrorBoundary>
        </main>
        
        <ErrorBoundary section="Footer">
          <Footer />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;