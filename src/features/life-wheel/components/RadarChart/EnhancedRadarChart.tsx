import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './RadarChart.module.css';

interface DataPoint {
  id: string;
  name: string;
  value: number;
  color: string | { from: string; to: string };
  description?: string;
  icon?: string;
  gradient?: string;
  highlight?: boolean;
  healthStatus?: string;
}

interface RadarChartProps {
  data: DataPoint[];
  comparisonData?: DataPoint[] | null;
  showComparison?: boolean;
  maxValue?: number;
  animate?: boolean;
  onCategoryClick?: (category: DataPoint) => void;
  className?: string;
}

const EnhancedRadarChart = ({
  data,
  comparisonData = null,
  showComparison = false,
  maxValue = 10,
  animate = true,
  onCategoryClick,
  className = '',
}: RadarChartProps): JSX.Element => {
  const [animatedData, setAnimatedData] = useState<DataPoint[]>(
    data.map(point => ({ ...point, value: 0 }))
  );

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Add a tooltip component to the radar chart
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
    category: DataPoint | null;
  }>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    category: null,
  });

  // Update animated data when real data changes
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimatedData(data);
    }
  }, [data, animate]);

  // Generate points for the radar chart
  const getPolygonPoints = (dataPoints: DataPoint[], scale = 1): string => {
    const centerX = 150;
    const centerY = 150;
    const radius = 120 * scale;

    return dataPoints
      .map((point, index) => {
        const angleInRadians = (2 * Math.PI * index) / dataPoints.length - Math.PI / 2;
        const normalizedValue = (point.value / maxValue) * radius;
        const x = centerX + normalizedValue * Math.cos(angleInRadians);
        const y = centerY + normalizedValue * Math.sin(angleInRadians);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate grid circles and axis lines
  const gridLines = useMemo(() => {
    const centerX = 150;
    const centerY = 150;
    const gridLevels = 5;
    const axisLines = data.map((_, index) => {
      const angleInRadians = (2 * Math.PI * index) / data.length - Math.PI / 2;
      const x = centerX + 120 * Math.cos(angleInRadians);
      const y = centerY + 120 * Math.sin(angleInRadians);
      return { x1: centerX, y1: centerY, x2: x, y2: y };
    });

    const circles = Array.from({ length: gridLevels }, (_, i) => {
      const radius = (120 * (i + 1)) / gridLevels;
      return { cx: centerX, cy: centerY, r: radius };
    });

    return { axisLines, circles };
  }, [data]);

  // Generate label positions
  const labelPositions = useMemo(() => {
    const centerX = 150;
    const centerY = 150;
    const radius = 135; // Slightly larger than the chart radius for labels

    return data.map((point, index) => {
      const angleInRadians = (2 * Math.PI * index) / data.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angleInRadians);
      const y = centerY + radius * Math.sin(angleInRadians);

      // Adjust text anchor based on position
      let textAnchor = 'middle';
      if (x < centerX - 30) textAnchor = 'end';
      else if (x > centerX + 30) textAnchor = 'start';

      return { x, y, textAnchor, category: point };
    });
  }, [data]);

  // Generate value indicator positions
  const valueIndicators = useMemo(() => {
    const centerX = 150;
    const centerY = 150;

    return animatedData.map((point, index) => {
      const angleInRadians = (2 * Math.PI * index) / animatedData.length - Math.PI / 2;
      const normalizedValue = (point.value / maxValue) * 120;
      const x = centerX + normalizedValue * Math.cos(angleInRadians);
      const y = centerY + normalizedValue * Math.sin(angleInRadians);

      return { x, y, value: point.value, color: point.color, id: point.id };
    });
  }, [animatedData, maxValue]);

  // Create gradients for each data point
  const gradientDefs = useMemo(() => {
    return data.map(point => {
      if (typeof point.color === 'object') {
        return (
          <linearGradient
            key={`gradient-${point.id}`}
            id={`gradient-${point.id}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor={point.color.from} stopOpacity="0.7" />
            <stop offset="100%" stopColor={point.color.to} stopOpacity="0.7" />
          </linearGradient>
        );
      }
      return null;
    });
  }, [data]);

  // Create comparison gradients
  const comparisonGradientDefs = useMemo(() => {
    if (!comparisonData) return null;

    return comparisonData.map(point => {
      if (typeof point.color === 'object') {
        return (
          <linearGradient
            key={`comparison-gradient-${point.id}`}
            id={`comparison-gradient-${point.id}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor={point.color.from} stopOpacity="0.4" />
            <stop offset="100%" stopColor={point.color.to} stopOpacity="0.4" />
          </linearGradient>
        );
      }
      return null;
    });
  }, [comparisonData]);

  return (
    <div
      className={`${styles.radarChartContainer} ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg
        viewBox="0 0 300 300"
        className={styles.radarChart}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '600px',
          maxHeight: '600px',
        }}
      >
        <defs>
          {gradientDefs}
          {comparisonGradientDefs}
        </defs>

        {/* Grid circles */}
        {gridLines.circles.map((circle, i) => (
          <circle
            key={`grid-circle-${i}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            className={styles.gridCircle}
          />
        ))}

        {/* Axis lines */}
        {gridLines.axisLines.map((line, i) => (
          <line
            key={`axis-line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className={styles.axisLine}
          />
        ))}

        {/* Comparison data polygon */}
        {showComparison && comparisonData && (
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            points={getPolygonPoints(comparisonData)}
            fill="rgba(100, 100, 100, 0.2)"
            stroke="rgba(200, 200, 200, 0.6)"
            strokeWidth="1"
            className={styles.comparisonPolygon}
          />
        )}

        {/* Main data polygon */}
        <motion.polygon
          initial={{ points: getPolygonPoints(data.map(point => ({ ...point, value: 0 }))) }}
          animate={{ points: getPolygonPoints(animatedData) }}
          transition={{ duration: animate ? 1 : 0, ease: 'easeOut' }}
          fill="url(#radar-gradient)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1.5"
          className={styles.dataPolygon}
        />

        {/* Value indicators */}
        {valueIndicators.map(indicator => (
          <motion.circle
            key={`indicator-${indicator.id}`}
            cx={indicator.x}
            cy={indicator.y}
            r={hoveredCategory === indicator.id ? 6 : 4}
            fill={typeof indicator.color === 'string' ? indicator.color : indicator.color.from}
            stroke="white"
            strokeWidth="2"
            className={styles.valueIndicator}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: animate ? 0.3 : 0, delay: animate ? 0.8 : 0 }}
            onMouseEnter={() => {
              setHoveredCategory(indicator.id);
              const dataPoint = data.find(d => d.id === indicator.id);
              if (dataPoint) {
                setTooltipData({
                  visible: true,
                  text: dataPoint.name,
                  x: indicator.x,
                  y: indicator.y - 50,
                  category: dataPoint,
                });
              }
            }}
            onMouseLeave={() => {
              setHoveredCategory(null);
              setTooltipData(prev => ({ ...prev, visible: false }));
            }}
            onClick={() => {
              const dataPoint = data.find(d => d.id === indicator.id);
              if (dataPoint && onCategoryClick) onCategoryClick(dataPoint);
            }}
          />
        ))}

        {/* Comparison value indicators */}
        {showComparison &&
          comparisonData &&
          comparisonData.map((point, index) => {
            const angleInRadians = (2 * Math.PI * index) / comparisonData.length - Math.PI / 2;
            const normalizedValue = (point.value / maxValue) * 120;
            const x = 150 + normalizedValue * Math.cos(angleInRadians);
            const y = 150 + normalizedValue * Math.sin(angleInRadians);

            return (
              <motion.circle
                key={`comparison-indicator-${point.id}`}
                cx={x}
                cy={y}
                r={3}
                fill="rgba(255, 255, 255, 0.6)"
                stroke="rgba(200, 200, 200, 0.8)"
                strokeWidth="1"
                className={styles.comparisonIndicator}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
              />
            );
          })}

        {/* Labels */}
        {labelPositions.map((label, i) => (
          <g
            key={`label-${i}`}
            className={styles.labelGroup}
            onClick={() => onCategoryClick && onCategoryClick(label.category)}
            onMouseEnter={() => setHoveredCategory(label.category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <text
              x={label.x}
              y={label.y}
              textAnchor={label.textAnchor}
              className={`${styles.categoryLabel} ${hoveredCategory === label.category.id ? styles.highlightedLabel : ''}`}
            >
              {label.category.name}
            </text>
          </g>
        ))}

        {/* Value labels at grid circles */}
        {gridLines.circles.map((circle, i) => (
          <text
            key={`value-label-${i}`}
            x={150}
            y={150 - circle.r - 2}
            textAnchor="middle"
            className={styles.valueLabel}
          >
            {Math.round((maxValue * (i + 1)) / gridLines.circles.length)}
          </text>
        ))}

        {/* Radar gradient */}
        <defs>
          <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(217, 70, 239, 0.4)" />
          </radialGradient>
        </defs>

        {/* Tooltip */}
        {tooltipData.visible && tooltipData.category && (
          <g className={styles.tooltip} transform={`translate(${tooltipData.x}, ${tooltipData.y})`}>
            <rect
              x="-60"
              y="-40"
              width="120"
              height="50"
              rx="5"
              fill="rgba(0, 0, 0, 0.7)"
              strokeWidth="1"
              stroke="rgba(255, 255, 255, 0.3)"
            />
            <text x="0" y="-20" textAnchor="middle" className={styles.tooltipTitle}>
              {tooltipData.category.name}
            </text>
            <text x="0" y="0" textAnchor="middle" className={styles.tooltipValue}>
              Score: {tooltipData.category.value}/10
            </text>
            <text
              x="0"
              y="20"
              textAnchor="middle"
              className={styles.tooltipHealth}
              fill={
                typeof tooltipData.category.color === 'string' ? tooltipData.category.color : '#fff'
              }
            >
              {tooltipData.category.healthStatus || ''}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default EnhancedRadarChart;
