import { useState } from 'react';
import styles from './Tools.module.css';
import { TOOLS, Tool } from '@/constants/tools';

const Tools = () => {
  const [activeTab, setActiveTab] = useState<Tool>(TOOLS[0]);

  return (
    <section className={styles.toolsContainer}>
      <div className={styles.toolsContent}>
        {/* Title Section */}
        <div className={styles.titleContainer}>
          <h2 className={styles.mainTitle}>
            <span className={styles.gradientText}>Leonardo's</span> Toolkit
            <svg 
              className={styles.toolIcon} 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </h2>
        </div>

        <div className={styles.contentWrapper}>
          {/* Tabs Navigation */}
          <div className={styles.tabsContainer}>
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool)}
                className={`${styles.tab} ${tool.id === activeTab.id ? styles.activeTab : ''}`}
              >
                {tool.title}
              </button>
            ))}
          </div>

          {/* Content Section */}
          <div className={styles.contentContainer}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>{activeTab.title}</h3>
              <h3 className={styles.subtitle}>{activeTab.subtitle}</h3>
              <p className={styles.description}>{activeTab.description}</p>
            </div>

            <div className={styles.videoContainer}>
              <video
                autoPlay
                muted
                loop
                playsInline
                className={styles.video}
                key={activeTab.videoSrc}
              >
                <source src={activeTab.videoSrc} type="video/webm" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tools; 