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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const percentage = calculateProgress(e.clientX, e.clientY);
    if (Math.abs((percentage * duration) - progress) > 0.1) {
      onSeek(percentage * duration);
    }
  }, [isDragging, calculateProgress, duration, onSeek, progress]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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

  const handlePosition = useMemo(() => {
    const progressPercentage = duration > 0 ? progress / duration : 0;
    const angle = (progressPercentage * 2 * Math.PI) - (Math.PI / 2);
    return {
      x: radius + padding + (radius - 4) * Math.cos(angle),
      y: radius + padding + (radius - 4) * Math.sin(angle)
    };
  }, [progress, duration, radius, padding]);

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
    >
      {/* Define gradient */}
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx={radius + padding}
        cy={radius + padding}
        r={radius - 2}
        className={styles.progressBg}
        strokeWidth="4"
      />
      {/* Progress circle */}
      <circle
        cx={radius + padding}
        cy={radius + padding}
        r={radius - 2}
        className={styles.progressBar}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${radius + padding} ${radius + padding})`}
        strokeLinecap="round"
      />
      {/* Handle */}
      <circle
        cx={handlePosition.x}
        cy={handlePosition.y}
        r={6}
        className={styles.progressHandle}
        fill="white"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
    </svg>
  );
}; 