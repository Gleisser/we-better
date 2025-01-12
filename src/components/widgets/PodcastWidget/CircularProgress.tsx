import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import styles from './PodcastWidget.module.css';

interface CircularProgressProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const CircularProgress = ({ progress, duration, onSeek }: CircularProgressProps) => {
  const radius = 95;
  const padding = 8;
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [previewPercentage, setPreviewPercentage] = useState<number | null>(null);

  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  
  const calculateProgress = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;
    
    const rect = svgRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    const angle = Math.atan2(
      clientY - center.y,
      clientX - center.x
    );

    // Convert angle to percentage (0 to 1)
    let percentage = (angle + Math.PI / 2) / (2 * Math.PI);
    if (percentage < 0) percentage += 1;
    
    return percentage;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (isDragging) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    const angle = Math.atan2(
      e.clientY - center.y,
      e.clientX - center.x
    );

    let percentage = (angle + Math.PI / 2) / (2 * Math.PI);
    if (percentage < 0) percentage += 1;
    
    setPreviewPercentage(percentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPreviewPercentage(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const strokeDashoffset = useMemo(() => {
    const progressPercentage = duration > 0 ? progress / duration : 0;
    return (1 - progressPercentage) * circumference;
  }, [progress, duration, circumference]);

  const handleSeek = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (isDragging) return;
    
    // Get the clicked element
    const clickedElement = e.target as SVGElement;
    
    // Only handle clicks on the progress bar or background circle
    if (!clickedElement.classList.contains(styles.progressBar) && 
        !clickedElement.classList.contains(styles.progressBg)) {
      return;
    }
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    const angle = Math.atan2(
      e.clientY - center.y,
      e.clientX - center.x
    );

    // Convert angle to percentage (0 to 1)
    let percentage = (angle + Math.PI / 2) / (2 * Math.PI);
    if (percentage < 0) percentage += 1;

    onSeek(percentage * duration);
  }, [duration, onSeek, isDragging]);

  return (
    <svg 
      viewBox={`0 0 ${(radius + padding) * 2} ${(radius + padding) * 2}`}
      className={styles.progressRing}
      ref={svgRef}
      onClick={handleSeek}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Define gradient */}
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="preview-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D946EF" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx={radius + padding}
        cy={radius + padding}
        r={radius - 2}
        className={styles.progressBg}
        strokeWidth="8"
      />
      
      {/* Preview circle */}
      {previewPercentage !== null && (
        <circle
          cx={radius + padding}
          cy={radius + padding}
          r={radius - 2}
          className={styles.progressPreview}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={(1 - previewPercentage) * circumference}
          transform={`rotate(-90 ${radius + padding} ${radius + padding})`}
          strokeLinecap="round"
        />
      )}
      
      {/* Progress circle */}
      <circle
        cx={radius + padding}
        cy={radius + padding}
        r={radius - 2}
        className={styles.progressBar}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${radius + padding} ${radius + padding})`}
        strokeLinecap="round"
      />
    </svg>
  );
}; 