import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { prefetchHero } from '@/shared/hooks/useHero';
import ErrorBoundary from './shared/components/common/ErrorBoundary/ErrorBoundary';
import { Header, Hero, Footer } from './shared/components/layout';
import Features from './shared/components/layout/Features/Features';
import Highlights from './shared/components/layout/Highlights/Highlights';
import { Tools } from './shared/components/layout/Tools';
import { Showcase } from './shared/components/layout/Showcase';
import { Gallery } from './shared/components/layout/Gallery';
import { Community } from './shared/components/layout/Community';
import { Testimonies } from './shared/components/layout/Testimonies';
import { Partners } from './shared/components/layout/Partners';
import PreFooter from './shared/components/layout/PreFooter/PreFooter';
import { FeaturesErrorFallback } from './shared/components/layout/Features/FeaturesErrorFallback';
import { HighlightsErrorFallback } from './shared/components/layout/Highlights/HighlightsErrorFallback';
import { ToolsErrorFallback } from './shared/components/layout/Tools/ToolsErrorFallback';
import { ShowcaseErrorFallback } from './shared/components/layout/Showcase/ShowcaseErrorFallback';
import { GalleryErrorFallback } from './shared/components/layout/Gallery/GalleryErrorFallback';
import { CommunityErrorFallback } from './shared/components/layout/Community/CommunityErrorFallback';
import { TestimoniesErrorFallback } from './shared/components/layout/Testimonies/TestimoniesErrorFallback';
import { PartnersErrorFallback } from './shared/components/layout/Partners/PartnersErrorFallback';

function App() {
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

export default App;