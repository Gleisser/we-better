import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Tools.module.css';
import { TOOLS_FALLBACK } from '@/constants/fallback';
import { useTool } from '@/hooks/useTool';
import { ToolTab } from '@/types/tool';
import { API_CONFIG } from '@/lib/api-config';
import { ToolIcon } from '@/components/common/icons';
import ToolsSkeleton from './ToolsSkeleton';

const Tools = () => {
  const { data, isLoading } = useTool();
  const tabs = data?.data?.tabs || TOOLS_FALLBACK;
  
  // Initialize activeTab after data is loaded
  const [activeTab, setActiveTab] = useState<ToolTab>(() => {
    // If we have API data, use the first tab from API data
    if (data?.data?.tabs?.length) {
      return data.data.tabs[0];
    }
    // Otherwise use fallback
    return TOOLS_FALLBACK[0];
  });

  // Update activeTab when data changes
  useEffect(() => {
    if (data?.data?.tabs?.length) {
      setActiveTab(data.data.tabs[0]);
    }
  }, [data?.data?.tabs]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const gradientText = data?.data?.title.split(' ')[0];
  const toolName = data?.data?.title.split(' ')[1];

  // Single source of truth for video handling
  const handleVideoPlayback = useCallback((video: HTMLVideoElement, shouldPlay: boolean) => {
    if (shouldPlay) {
      video.play().catch(() => {
        // Ignore play errors
      });
    } else {
      video.pause();
    }
  }, []);

  // Setup video source and load
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

  // Show skeleton only while loading and before fallback
  if (isLoading && !tabs.length) {
    return <ToolsSkeleton />;
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