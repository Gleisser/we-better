import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LifeCategory, RadarChartProps } from '../../types';
import { MAX_CATEGORY_VALUE } from '../../constants/categories';
import styles from './RadarChart.module.css';

const RadarChart = ({ 
  data, 
  size = 400, 
  className = '', 
  animate = true,
  onCategoryClick 
}: RadarChartProps) => {
  const [chartPoints, setChartPoints] = useState<string>('');
  const [gridPolygons, setGridPolygons] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate radar chart coordinates based on data values
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const center = size / 2;
    const radius = size * 0.4; // Leave room for labels
    const angleStep = (Math.PI * 2) / data.length;
    
    // Calculate points for data polygon
    const points = data.map((cat, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start at top (- PI/2)
      const value = cat.value / MAX_CATEGORY_VALUE;
      const x = center + radius * value * Math.cos(angle);
      const y = center + radius * value * Math.sin(angle);
      return `${x},${y}`;
    });
    
    setChartPoints(points.join(' '));
    
    // Generate grid lines (value levels)
    const gridLines = [];
    for (let level = 0.2; level <= 1; level += 0.2) {
      const gridPoints = data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * level * Math.cos(angle);
        const y = center + radius * level * Math.sin(angle);
        return `${x},${y}`;
      });
      gridLines.push(gridPoints.join(' '));
    }
    setGridPolygons(gridLines);
  }, [data, size]);

  if (!data || data.length === 0) {
    return <div className={styles.radarChartContainer}>No data available</div>;
  }

  return (
    <div className={`${styles.radarChartContainer} ${className}`}>
      <svg 
        ref={svgRef}
        className={styles.radarSvg}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background grid */}
        {gridPolygons.map((points, idx) => (
          <polygon 
            key={`grid-${idx}`}
            className={styles.radarGrid}
            points={points}
          />
        ))}
        
        {/* Axis lines */}
        {data.map((_, idx) => {
          const angle = (idx * (360 / data.length)) - 90;
          const radian = (angle * Math.PI) / 180;
          const center = size / 2;
          const x = center + (size * 0.4) * Math.cos(radian);
          const y = center + (size * 0.4) * Math.sin(radian);
          
          return (
            <line
              key={`axis-${idx}`}
              className={styles.radarAxis}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
            />
          );
        })}
        
        {/* Data polygon */}
        <motion.polygon
          initial={animate ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.radarArea}
          points={chartPoints}
          fill="url(#lifeWheelGradient)"
          stroke="#8B5CF6"
        />
        
        {/* Data points */}
        {data.map((cat, idx) => {
          const angle = (idx * (360 / data.length)) - 90;
          const radian = (angle * Math.PI) / 180;
          const center = size / 2;
          const radius = size * 0.4 * (cat.value / MAX_CATEGORY_VALUE);
          const x = center + radius * Math.cos(radian);
          const y = center + radius * Math.sin(radian);
          
          return (
            <motion.circle
              key={`point-${idx}`}
              initial={animate ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ 
                delay: 0.8 + idx * 0.1, 
                duration: 0.3 
              }}
              whileHover={{ 
                scale: 1.2,
                filter: "drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.5))"
              }}
              className={styles.radarPoint}
              cx={x}
              cy={y}
              r={6}
              fill={cat.color}
              stroke="#fff"
              onClick={() => onCategoryClick?.(cat)}
            />
          );
        })}
        
        {/* Category labels */}
        {data.map((cat, idx) => {
          const angle = (idx * (360 / data.length)) - 90;
          const radian = (angle * Math.PI) / 180;
          const center = size / 2;
          const labelRadius = size * 0.45; // Place labels outside the chart
          const x = center + labelRadius * Math.cos(radian);
          const y = center + labelRadius * Math.sin(radian);
          
          // Adjust text alignment based on position
          const textAnchor = 
            Math.abs(angle) < 10 || Math.abs(angle - 180) < 10 
              ? 'middle' 
              : angle > 0 && angle < 180 
                ? 'start' 
                : 'end';
          
          return (
            <motion.text
              key={`label-${idx}`}
              initial={animate ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              className={styles.categoryLabel}
              x={x}
              y={y}
              dy="0.3em"
              textAnchor={textAnchor}
            >
              {cat.name}
            </motion.text>
          );
        })}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="lifeWheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default RadarChart; 