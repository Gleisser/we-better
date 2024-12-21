import { useState, useRef, useEffect } from 'react';
import styles from './Tools.module.css';
import { TOOLS_FALLBACK } from '@/constants/fallback';
import { useTool } from '@/hooks/useTool';
import { Tool, ToolTab } from '@/types/tool';
import { API_CONFIG } from '@/lib/api-config';
import { ToolIcon } from '@/components/common/icons';
import ToolsSkeleton from './ToolsSkeleton';

const Tools = () => {
  const { data } = useTool();
  const tabs = data?.data?.tabs || TOOLS_FALLBACK;
  const [activeTab, setActiveTab] = useState<ToolTab | Tool>(tabs[0]);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gradientText = data?.data?.title.split(' ')[0];
  const toolName = data?.data?.title.split(' ')[1];

  // Cleanup and setup video on tab change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // First pause current video
    video.pause();

    // Get new video URL
    const videoUrl = data?.data 
      ? API_CONFIG.imageBaseURL + activeTab.videoSrc.video[0].url 
      : activeTab.videoSrc.video[0].url;
    
    // Update video source
    video.src = videoUrl;
    video.load();

    // Play when metadata is loaded
    const handleMetadata = () => {
      if (video) {
        video.play().catch(() => {
          // Ignore abort errors
        });
      }
    };

    video.addEventListener('loadedmetadata', handleMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [activeTab.id, data?.data]);

  // Setup Intersection Observer for visibility
  useEffect(() => {
    let isSubscribed = true;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video || !isSubscribed) return;

          if (entry.isIntersecting) {
            if (video.paused && video.readyState >= 2) {
              video.play().catch(() => {
                // Ignore abort errors
              });
            }
          } else {
            video.pause();
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      isSubscribed = false;
      observerRef.current?.disconnect();
    };
  }, []);

  if (data?.isLoading && !data?.showFallback) {
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
              <h4 className={styles.subtitle}>{activeTab.subtitle}</h4>
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