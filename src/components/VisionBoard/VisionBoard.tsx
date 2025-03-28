import React, { useState, useEffect } from 'react';
import { themes } from './constants/themes';
import styles from './VisionBoard.module.css';

interface VisionBoardProps {
  lifeWheelCategories: any[];
  onSave: (data: any) => Promise<boolean>;
  data?: any;
  loading?: boolean;
  error?: string;
  onShare?: (data: any) => void;
  className?: string;
  readOnly?: boolean;
}

export const VisionBoard: React.FC<VisionBoardProps> = ({
  lifeWheelCategories,
  data,
  loading = false,
  error,
  onSave,
  className = '',
  readOnly = false
}) => {
  const [boardData, setBoardData] = useState({
    title: 'My Vision Board',
    description: 'Based on my Life Wheel assessment',
    themeId: 'light',
    categories: lifeWheelCategories.map(cat => cat.id),
    content: []
  });
  
  useEffect(() => {
    if (data) {
      setBoardData(data);
    } else {
      setBoardData({
        title: 'My Vision Board',
        description: 'Based on my Life Wheel assessment',
        themeId: 'light',
        categories: lifeWheelCategories.map(cat => cat.id),
        content: []
      });
    }
  }, [data, lifeWheelCategories]);
  
  const activeTheme = themes.find(theme => theme.id === boardData.themeId) || themes[0];
  
  const handleSave = async () => {
    try {
      await onSave(boardData);
      alert('Vision board saved!');
    } catch (err) {
      console.error('Error saving vision board:', err);
      alert('Failed to save vision board');
    }
  };
  
  if (loading) {
    return (
      <div className={`${styles.visionBoardContainer} ${className}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your vision board...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${styles.visionBoardContainer} ${className}`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button 
            className={styles.retryButton} 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${styles.visionBoardContainer} ${className}`}
      style={{ fontFamily: activeTheme.fontFamily }}
    >
      {/* Background layer */}
      <div 
        className={styles.backgroundLayer}
        style={{ 
          background: activeTheme.backgroundGradient,
          opacity: 0.8
        }}
      ></div>
      
      {/* Canvas */}
      <div className={styles.canvasContainer}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%', 
          flexDirection: 'column',
          color: activeTheme.isDark ? '#fff' : '#333',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Your Vision Board is ready!</h3>
          <p style={{ marginBottom: '20px' }}>
            Based on your Life Wheel assessment, we've prepared a personalized Vision Board for you.
            Add images, text, and goals to visualize your aspirations.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            {lifeWheelCategories.map(category => (
              <div key={category.id} style={{
                padding: '10px 15px',
                background: category.color || activeTheme.accentColor,
                color: '#fff',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {category.name}
              </div>
            ))}
          </div>
          
          {!readOnly && (
            <button 
              onClick={handleSave}
              style={{ 
                padding: '12px 24px', 
                background: activeTheme.accentColor, 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Save Vision Board
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 