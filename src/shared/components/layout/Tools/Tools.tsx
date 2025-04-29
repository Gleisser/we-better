import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Tools.module.css';
import { TOOLS_FALLBACK } from '@/utils/constants/fallback';
import { useTool } from '@/shared/hooks/useTool';
import { ToolTab } from '@/types/tool';
import { API_CONFIG } from '@/core/config/api-config';
import { ToolIcon } from '@/shared/components/common/icons';
import ToolsSkeleton from './ToolsSkeleton';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';

const Tools = () => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useTool();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load tools content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  const tabs = data?.data?.tabs || TOOLS_FALLBACK;
  
  // State and refs
  const [activeTab, setActiveTab] = useState<ToolTab>(() => {
    return data?.data?.tabs?.[0] || TOOLS_FALLBACK[0];
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Content preparation
  const gradientText = data?.data?.title.split(' ')[0];
  const toolName = data?.data?.title.split(' ')[1];

  // Update activeTab when data changes
  useEffect(() => {
    if (data?.data?.tabs?.length) {
      setActiveTab(data.data.tabs[0]);
    }
  }, [data?.data?.tabs]);

  // Collect poster images for preloading
  const getPosterUrls = useCallback(() => {
    return tabs.map(tab => `/assets/images/tools/${tab.id}-poster.webp`);
  }, [tabs]);

  // Handle image preloading
  const loadImages = useCallback(async () => {
    const posterUrls = getPosterUrls();
    if (posterUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(posterUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getPosterUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  // Video playback handling
  const handleVideoPlayback = useCallback((video: HTMLVideoElement, shouldPlay: boolean) => {
    if (shouldPlay) {
      video.play().catch(() => {
        // Ignore play errors
      });
    } else {
      video.pause();
    }
  }, []);

  // Video setup
  const setupVideo = useCallback((video: HTMLVideoElement, tab: ToolTab) => {
    const videoUrl = data?.data 
      ? API_CONFIG.imageBaseURL + tab.videoSrc.video[0].url 
      : tab.videoSrc.video[0].url;

    video.src = videoUrl;
    video.load();

    video.addEventListener('loadedmetadata', () => {
      if (isInView) {
        handleVideoPlayback(video, true);
      }
    }, { once: true });
  }, [data?.data, isInView, handleVideoPlayback]);

  // Intersection Observer setup
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { rootMargin: '50px 0px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Handle video playback based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && video.readyState >= 2) {
      handleVideoPlayback(video, true);
    } else {
      handleVideoPlayback(video, false);
    }
  }, [isInView, handleVideoPlayback]);

  // Initial video setup and tab changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !tabs.length) return;

    setupVideo(video, activeTab);

    return () => {
      video.pause();
      video.removeAttribute('src');
    };
  }, [activeTab, tabs, setupVideo]);

  // Load poster images
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Show loading state
  if (isDataLoading) {
    return <ToolsSkeleton />;
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.toolsContainer}>
        <div className={styles.toolsContent}>
          <div className={styles.errorState} role="alert">
            <p>{error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={styles.toolsContainer}
      aria-labelledby="tools-title"
    >
      <div className={styles.toolsContent}>
        <div className={styles.titleContainer}>
          <h2 
            className={styles.mainTitle}
            id="tools-title"
          >
            <span className={styles.gradientText}>{gradientText || 'WeBetter'}</span> {toolName || 'Toolkit'}
            <ToolIcon className={styles.toolIcon} aria-hidden="true" />
          </h2>
        </div>

        <div className={styles.contentWrapper}>
          <div 
            className={styles.tabsContainer}
            role="tablist"
            aria-label="Tool categories"
          >
            {tabs.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool)}
                className={`${styles.tab} ${tool.id === activeTab.id ? styles.activeTab : ''}`}
                role="tab"
                aria-selected={tool.id === activeTab.id}
                aria-controls={`panel-${tool.id}`}
                id={`tab-${tool.id}`}
              >
                {tool.title}
              </button>
            ))}
          </div>

          <div 
            className={styles.contentContainer}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.id}`}
            id={`panel-${activeTab.id}`}
          >
            <div className={styles.textContent}>
              <h3 className={styles.title}>{activeTab.title}</h3>
              <p className={styles.subtitle}>{activeTab.subtitle}</p>
              <p className={styles.description}>{activeTab.description}</p>
            </div>

            <div 
              className={styles.videoContainer} 
              ref={containerRef}
              role="presentation"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className={styles.video}
                key={activeTab.videoSrc.id}
                poster={`/assets/images/tools/${activeTab.id}-poster.webp`}
                aria-hidden="true"
              >
                {/* Source will be set dynamically when in view */}
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tools; 