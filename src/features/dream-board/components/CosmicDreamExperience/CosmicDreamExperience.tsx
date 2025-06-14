import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Dream } from '../../types';
import styles from './CosmicDreamExperience.module.css';
import { createPortal } from 'react-dom';

interface CosmicDreamExperienceProps {
  dreams: Dream[];
  categories: string[];
  onDreamSelect: (dream: Dream | null) => void;
  activeDream: Dream | null;
}

interface DreamNode {
  dream: Dream;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  connections: string[];
  brightness: number;
  pulsePhase: number;
  category: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
  depth: number;
}

interface Badge {
  x: number;
  y: number;
  size: number;
  color: string;
  parentId: string;
  angle: number;
  distance: number;
}

interface Supernova {
  x: number;
  y: number;
  color: string;
  id: string;
  createdAt: number;
}

// Helper function to normalize category names (capitalize first letter)
const normalizeCategory = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

// Helper function to get category color (case-insensitive)
const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    travel: '#4FD1C5',
    skills: '#9F7AEA',
    finance: '#F6AD55',
    finances: '#F6AD55', // Handle both "finance" and "finances"
    health: '#68D391',
    relationships: '#FC8181',
    career: '#63B3ED',
    education: '#F687B3',
    spirituality: '#B794F4',
  };

  const normalizedCategory = category.toLowerCase();
  return categoryColors[normalizedCategory] || '#8B5CF6';
};

// Helper function to check if a dream matches the selected category (case-insensitive)
const dreamMatchesCategory = (dream: Dream, selectedCategory: string): boolean => {
  if (selectedCategory === 'all') return true;
  return normalizeCategory(dream.category) === selectedCategory;
};

export const CosmicDreamExperience: React.FC<CosmicDreamExperienceProps> = ({
  dreams,
  categories,
  onDreamSelect,
  activeDream,
}) => {
  // Create a comprehensive list of categories that includes both actual categories from dreams
  // and predefined categories to ensure we show all possible categories
  const displayCategories = useMemo(() => {
    const allPossibleCategories = [
      'Travel',
      'Skills',
      'Finance',
      'Health',
      'Relationships',
      'Career',
      'Education',
      'Spirituality',
    ];

    // Normalize categories from dreams (capitalize first letter)
    const normalizedDreamCategories = categories.map(cat => normalizeCategory(cat));

    // Combine normalized categories from dreams with predefined ones, removing duplicates
    return [...new Set([...normalizedDreamCategories, ...allPossibleCategories])];
  }, [categories]);
  // Basic state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'cosmic' | 'constellation'>('cosmic');

  // Visualization elements
  const [dreamNodes, setDreamNodes] = useState<DreamNode[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [supernovas, setSupernovas] = useState<Supernova[]>([]);

  // Interaction state
  const [hoveredDream, setHoveredDream] = useState<Dream | null>(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  // State for positioning the detail card
  const [detailCardPosition, setDetailCardPosition] = useState({ x: 0, y: 0 });
  const [showPortalCard, setShowPortalCard] = useState(false);

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Initialize the universe with nodes, particles, and other elements
  const initializeUniverse = useCallback(() => {
    const center = {
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    };

    // Create initial particles for starry background
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      initialParticles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2,
        speed: 0.02 + Math.random() * 0.08,
        alpha: 0.1 + Math.random() * 0.6,
        color: 'white',
        depth: Math.random(),
      });
    }
    setParticles(initialParticles);

    // Group dreams by category
    const dreamsByCategory: Record<string, Dream[]> = {};
    dreams.forEach(dream => {
      if (!dreamsByCategory[dream.category]) {
        dreamsByCategory[dream.category] = [];
      }
      dreamsByCategory[dream.category].push(dream);
    });

    // Create connections between dreams
    const createConnections = (dream: Dream): string[] => {
      const connections: string[] = [];

      // Connect dreams with same category
      const sameCategory = dreams.filter(d => d.id !== dream.id && d.category === dream.category);
      sameCategory.slice(0, 3).forEach(d => connections.push(d.id));

      // Connect dreams with similar timeframe
      const sameTimeframe = dreams.filter(
        d => d.id !== dream.id && d.timeframe === dream.timeframe && !connections.includes(d.id)
      );

      // Limit connections to avoid too many lines
      const limitedTimeframe = sameTimeframe.slice(0, 2);
      limitedTimeframe.forEach(d => connections.push(d.id));

      return connections;
    };

    // Position nodes by category in a galaxy-like formation
    const nodes: DreamNode[] = [];
    const categoryCount = Object.keys(dreamsByCategory).length;
    let categoryIndex = 0;

    for (const [_category, categoryDreams] of Object.entries(dreamsByCategory)) {
      const categoryAngle = (categoryIndex / categoryCount) * Math.PI * 2;
      const categoryDistance = dimensions.width * 0.25;
      const categoryX = center.x + Math.cos(categoryAngle) * categoryDistance;
      const categoryY = center.y + Math.sin(categoryAngle) * categoryDistance;

      categoryDreams.forEach((dream, dreamIndex) => {
        // Position dreams in an arc around their category center
        const dreamCount = categoryDreams.length;
        const arcAngle = (dreamIndex / Math.max(1, dreamCount - 1)) * Math.PI - Math.PI / 2;
        const arcRadius = 80 + (dreamIndex % 3) * 30;

        const x = categoryX + Math.cos(arcAngle) * arcRadius;
        const y = categoryY + Math.sin(arcAngle) * arcRadius;

        // Size based on importance (milestones count and progress)
        const importanceFactor = dream.milestones.length / 5 + dream.progress;
        const nodeRadius = 15 + importanceFactor * 10;

        // Color based on category
        const color = getCategoryColor(dream.category);

        // Initial brightness based on progress
        const brightness = 0.4 + dream.progress * 0.6;

        nodes.push({
          dream,
          x,
          y,
          radius: nodeRadius,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          color,
          connections: createConnections(dream),
          brightness,
          pulsePhase: Math.random() * Math.PI * 2,
          category: dream.category,
        });
      });

      categoryIndex++;
    }

    // Create achievement badges for completed milestones
    const initialBadges: Badge[] = [];

    nodes.forEach(node => {
      const completedMilestones = node.dream.milestones.filter(m => m.completed);

      completedMilestones.forEach((_, index) => {
        const angle = (index / completedMilestones.length) * Math.PI * 2;
        initialBadges.push({
          x: node.x,
          y: node.y,
          size: 8,
          color: node.color,
          parentId: node.dream.id,
          angle,
          distance: node.radius * 1.5,
        });
      });
    });

    setBadges(initialBadges);
    setDreamNodes(nodes);
    setIsInitialized(true);
  }, [dimensions, dreams]);

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = (): void => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Initialize the universe
  useEffect(() => {
    if (!isInitialized && dimensions.width > 0) {
      initializeUniverse();
    }
  }, [dimensions, isInitialized, initializeUniverse]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // Reset view when toggling fullscreen
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1);

      // Allow time for the container to resize before updating dimensions
      setTimeout(() => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Animation loop to render the cosmic dream map
  const animate = useCallback(() => {
    if (!canvasRef.current || !isInitialized) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw starry background with particles
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
      ctx.fill();

      // Move particles slowly with parallax effect
      particle.y += particle.speed * (1 - particle.depth * 0.5);

      // Add subtle horizontal drift
      particle.x += Math.sin(Date.now() * 0.0001 + particle.y * 0.01) * 0.1 * particle.depth;

      // Reset particles that go out of bounds
      if (particle.y > dimensions.height) {
        particle.y = 0;
        particle.x = Math.random() * dimensions.width;
      }
    });

    // Draw nebula background for categories
    if (viewMode === 'cosmic') {
      const uniqueCategories = [...new Set(dreams.map(d => d.category))];
      uniqueCategories.forEach(category => {
        const categoryNodes = dreamNodes.filter(n => n.dream.category === category);
        if (categoryNodes.length === 0) return;

        // Calculate center of this category's dreams
        const centerX = categoryNodes.reduce((sum, node) => sum + node.x, 0) / categoryNodes.length;
        const centerY = categoryNodes.reduce((sum, node) => sum + node.y, 0) / categoryNodes.length;

        // Skip if off-screen (with buffer)
        const screenX = centerX * zoomLevel + panOffset.x;
        const screenY = centerY * zoomLevel + panOffset.y;
        const buffer = 300;
        if (
          screenX < -buffer ||
          screenX > dimensions.width + buffer ||
          screenY < -buffer ||
          screenY > dimensions.height + buffer
        ) {
          return;
        }

        // Draw nebula glow
        const color = getCategoryColor(category);
        const radialGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          20,
          centerX,
          centerY,
          180
        );

        // Use more opacity for selected category
        const alpha = selectedCategory === 'all' || selectedCategory === category ? 0.15 : 0.05;

        radialGradient.addColorStop(
          0,
          `${color}${Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`
        );
        radialGradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.fillStyle = radialGradient;
        ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Update and draw connections
    dreamNodes.forEach(node => {
      // Skip if node is filtered out by category selection
      if (!dreamMatchesCategory(node.dream, selectedCategory)) return;

      const isActive = activeDream?.id === node.dream.id;
      const isHovered = hoveredDream?.id === node.dream.id;

      // Draw connections between nodes
      node.connections.forEach(targetId => {
        const target = dreamNodes.find(n => n.dream.id === targetId);
        if (!target) return;

        // Skip if target is filtered out by category selection
        if (!dreamMatchesCategory(target.dream, selectedCategory)) return;

        // Skip if connection is offscreen
        const midX = (node.x + target.x) / 2;
        const midY = (node.y + target.y) / 2;
        const screenMidX = midX * zoomLevel + panOffset.x;
        const screenMidY = midY * zoomLevel + panOffset.y;

        if (
          screenMidX < 0 ||
          screenMidX > dimensions.width ||
          screenMidY < 0 ||
          screenMidY > dimensions.height
        ) {
          return;
        }

        // Enhanced connections for active or hovered nodes
        if (
          isActive ||
          isHovered ||
          activeDream?.id === target.dream.id ||
          hoveredDream?.id === target.dream.id
        ) {
          // Draw animated connection line
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);

          // Animate flow along connection
          const time = Date.now() / 1000;
          const flowOffset = (time % 2) / 2; // 0 to 1 over 2 seconds

          // Create animated gradient for the line
          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);

          gradient.addColorStop(Math.max(0, flowOffset - 0.2), 'rgba(255,255,255,0.05)');
          gradient.addColorStop(flowOffset, 'rgba(255,255,255,0.7)');
          gradient.addColorStop(Math.min(1, flowOffset + 0.2), 'rgba(255,255,255,0.05)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Draw subtle connection line
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);

          // Make constellation lines more prominent in constellation view
          const alpha = viewMode === 'constellation' ? 0.3 : 0.15;

          ctx.strokeStyle = `${node.color}${Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    // Update and draw nodes
    dreamNodes.forEach(node => {
      // Skip if node is filtered out by category selection
      if (!dreamMatchesCategory(node.dream, selectedCategory)) return;

      // Skip if offscreen (with buffer for glow)
      const screenX = node.x * zoomLevel + panOffset.x;
      const screenY = node.y * zoomLevel + panOffset.y;
      const buffer = node.radius * 3 * zoomLevel;

      if (
        screenX < -buffer ||
        screenX > dimensions.width + buffer ||
        screenY < -buffer ||
        screenY > dimensions.height + buffer
      ) {
        return;
      }

      // Apply gentle floating motion
      node.x += node.vx;
      node.y += node.vy;

      // Add subtle circular motion to create a more dynamic cosmic feel
      const time = Date.now() * 0.001;
      node.x += Math.sin(time * 0.2 + node.y * 0.01) * 0.05;
      node.y += Math.cos(time * 0.2 + node.x * 0.01) * 0.05;

      // Ensure nodes stay within their category regions
      const categoryNodes = dreamNodes.filter(n => n.dream.category === node.dream.category);
      if (categoryNodes.length > 0) {
        const centerX = categoryNodes.reduce((sum, n) => sum + n.x, 0) / categoryNodes.length;
        const centerY = categoryNodes.reduce((sum, n) => sum + n.y, 0) / categoryNodes.length;

        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply gentle force to keep nodes within category region
        if (distance > 200) {
          node.vx -= dx * 0.0001;
          node.vy -= dy * 0.0001;
        }
      }

      // Bounce off the edges of the canvas
      if (node.x < node.radius || node.x > dimensions.width - node.radius) {
        node.vx *= -1;
      }
      if (node.y < node.radius || node.y > dimensions.height - node.radius) {
        node.vy *= -1;
      }

      // Limit velocity
      const maxVelocity = 0.2;
      const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (velocity > maxVelocity) {
        node.vx = (node.vx / velocity) * maxVelocity;
        node.vy = (node.vy / velocity) * maxVelocity;
      }

      // Pulse brightness based on phase
      node.pulsePhase += 0.01;
      const pulseFactor = 0.1 * Math.sin(node.pulsePhase) + 0.9;

      // Draw glow
      const glowRadius = node.radius * 2;
      const glow = ctx.createRadialGradient(
        node.x,
        node.y,
        node.radius * 0.5,
        node.x,
        node.y,
        glowRadius
      );

      const glowOpacity = node.brightness * pulseFactor;
      const glowHex = Math.floor(glowOpacity * 255)
        .toString(16)
        .padStart(2, '0');

      glow.addColorStop(0, `${node.color}${glowHex}`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = glow;
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw star
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      // Create inner glow gradient for the star
      const nodeGradient = ctx.createRadialGradient(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        node.radius * 0.1,
        node.x,
        node.y,
        node.radius
      );

      const brightnessHex = Math.floor(node.brightness * pulseFactor * 255)
        .toString(16)
        .padStart(2, '0');
      nodeGradient.addColorStop(0, '#FFFFFF');
      nodeGradient.addColorStop(0.4, `${node.color}FF`);
      nodeGradient.addColorStop(1, `${node.color}${brightnessHex}`);

      ctx.fillStyle = nodeGradient;
      ctx.fill();

      // Draw progress ring
      if (node.dream.progress > 0) {
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          node.radius + 2,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * node.dream.progress
        );
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Highlight active or hovered node
      const isActive = activeDream?.id === node.dream.id;
      const isHovered = hoveredDream?.id === node.dream.id;

      if (isActive || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? '#FFFFFF' : `${node.color}CC`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw dream name
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(node.dream.title, node.x, node.y + node.radius + 10);

        // Draw category below
        ctx.font = '12px Arial';
        ctx.fillStyle = `${node.color}CC`;
        ctx.fillText(node.dream.category, node.x, node.y + node.radius + 30);
      }
    });

    // Update and draw badges
    badges.forEach(badge => {
      const parentNode = dreamNodes.find(node => node.dream.id === badge.parentId);
      if (!parentNode) return;

      // Skip if parent is filtered out by category selection
      if (!dreamMatchesCategory(parentNode.dream, selectedCategory)) return;

      // Update badge position to orbit parent
      badge.angle += 0.01;
      badge.x = parentNode.x + Math.cos(badge.angle) * badge.distance;
      badge.y = parentNode.y + Math.sin(badge.angle) * badge.distance;

      // Draw badge
      ctx.beginPath();
      ctx.arc(badge.x, badge.y, badge.size, 0, Math.PI * 2);
      ctx.fillStyle = 'gold';
      ctx.fill();

      // Add glow
      const badgeGlow = ctx.createRadialGradient(
        badge.x,
        badge.y,
        0,
        badge.x,
        badge.y,
        badge.size * 2
      );
      badgeGlow.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
      badgeGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');

      ctx.beginPath();
      ctx.arc(badge.x, badge.y, badge.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = badgeGlow;
      ctx.fill();
    });

    // Draw celebration effects
    supernovas.forEach(supernova => {
      const age = (Date.now() - supernova.createdAt) / 1000; // Age in seconds
      const maxAge = 2; // Max age in seconds

      if (age < maxAge) {
        const progress = age / maxAge;
        const size = progress * 100;
        const opacity = 1 - progress;

        ctx.beginPath();
        ctx.arc(supernova.x, supernova.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `${supernova.color}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.fill();
      }
    });

    // Clean up old supernovas
    const currentTime = Date.now();
    setSupernovas(prev => prev.filter(s => currentTime - s.createdAt < 2000));

    ctx.restore();

    // Request next frame
    animationRef.current = requestAnimationFrame(animate);
  }, [
    dimensions,
    isInitialized,
    dreamNodes,
    particles,
    hoveredDream,
    activeDream,
    badges,
    supernovas,
    zoomLevel,
    panOffset,
    selectedCategory,
    viewMode,
    dreams,
  ]);

  // Start animation when initialized
  useEffect(() => {
    if (isInitialized) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isInitialized, animate]);

  // Toggle fullscreen mode
  const toggleFullscreen = (): void => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Toggle view mode between cosmic and constellation
  const _toggleViewMode = (): void => {
    setViewMode(viewMode === 'cosmic' ? 'constellation' : 'cosmic');
  };

  // Select a category to focus on
  const handleCategorySelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const category = event.target.value as string | 'all';
    setSelectedCategory(category);

    // Reset view when changing category
    if (category !== 'all') {
      const categoryNodes = dreamNodes.filter(node => node.dream.category === category);

      if (categoryNodes.length > 0) {
        // Calculate the average position of this category's nodes
        const avgX = categoryNodes.reduce((sum, node) => sum + node.x, 0) / categoryNodes.length;
        const avgY = categoryNodes.reduce((sum, node) => sum + node.y, 0) / categoryNodes.length;

        // Center on the category
        setPanOffset({
          x: dimensions.width / 2 - avgX * zoomLevel,
          y: dimensions.height / 2 - avgY * zoomLevel,
        });

        // Zoom in a bit
        setZoomLevel(1.5);
      }
    } else {
      // Reset view for "All" selection
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1);
    }
  };

  // Reset view to default
  const handleResetView = (): void => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    setSelectedCategory('all');
  };

  // Zoom controls
  const handleZoomIn = (): void => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = (): void => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  // Display the dream detail card for a selected dream
  const displayDreamDetails = (dream: Dream | null): void => {
    if (dream) {
      onDreamSelect(dream);
      setShowPortalCard(true);
      setShowDetailCard(true);
    } else {
      setShowDetailCard(false);
      setShowPortalCard(false);
      setTimeout(() => onDreamSelect(null), 300); // Delay to allow animation
    }
  };

  // Add ref for detail card
  const detailCardRef = useRef<HTMLDivElement>(null);
  const hideCardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoomLevel - panOffset.x / zoomLevel;
    const mouseY = (e.clientY - rect.top) / zoomLevel - panOffset.y / zoomLevel;

    // Handle dragging
    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Check if mouse is over a dream node
    let hoveredNode = null;
    for (const node of dreamNodes) {
      // Skip if node is filtered out by category selection
      if (!dreamMatchesCategory(node.dream, selectedCategory)) continue;

      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < node.radius) {
        hoveredNode = node;

        // Update card position for portal (only needed in normal mode)
        if (hoveredNode && !isFullscreen) {
          // Convert node position to screen coordinates
          const screenX = node.x * zoomLevel + panOffset.x;
          const screenY = node.y * zoomLevel + panOffset.y;

          // Get actual position in viewport
          const viewportX = screenX + rect.left;
          const viewportY = screenY + rect.top;

          setDetailCardPosition({ x: viewportX, y: viewportY });
        }

        break;
      }
    }

    // Clear any pending hide timeout when hovering a new node
    if (hoveredNode && (!hoveredDream || hoveredNode.dream.id !== hoveredDream.id)) {
      if (hideCardTimeoutRef.current) {
        clearTimeout(hideCardTimeoutRef.current);
        hideCardTimeoutRef.current = null;
      }
    }

    setHoveredDream(hoveredNode ? hoveredNode.dream : null);

    // Show detail card when hovering over a dream
    if (hoveredNode && !showDetailCard) {
      setShowDetailCard(true);
      setShowPortalCard(true);
    } else if (!hoveredNode && !activeDream) {
      // Use delayed hiding instead of immediate hiding
      if (!hideCardTimeoutRef.current) {
        hideCardTimeoutRef.current = setTimeout(() => {
          setShowDetailCard(false);
          setShowPortalCard(false);
          hideCardTimeoutRef.current = null;
        }, 300);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (e.button === 0) {
      // Left mouse button
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (e.button === 0) {
      // Left mouse button
      const wasDragging = isDragging.current;
      isDragging.current = false;

      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'pointer';
      }

      // If we weren't dragging, treat this as a click
      if (!wasDragging) {
        handleClick(e);
      }
    }
  };

  const handleMouseLeave = (): void => {
    isDragging.current = false;
    setHoveredDream(null);

    if (!activeDream) {
      setShowDetailCard(false);
    }

    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'pointer';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!canvasRef.current || isDragging.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoomLevel - panOffset.x / zoomLevel;
    const mouseY = (e.clientY - rect.top) / zoomLevel - panOffset.y / zoomLevel;

    // Check if click is on a dream node
    let clickedNode = null;
    for (const node of dreamNodes) {
      // Skip if node is filtered out by category selection
      if (!dreamMatchesCategory(node.dream, selectedCategory)) continue;

      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < node.radius) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      // If clicking on active dream, deselect it
      if (activeDream?.id === clickedNode.dream.id) {
        displayDreamDetails(null);
      } else {
        displayDreamDetails(clickedNode.dream);

        // Add celebration effect for completed dreams
        if (clickedNode.dream.progress >= 1) {
          const newSupernova = {
            x: clickedNode.x,
            y: clickedNode.y,
            color: clickedNode.color,
            id: `supernova-${Date.now()}`,
            createdAt: Date.now(),
          };

          setSupernovas(prev => [...prev, newSupernova]);
        }
      }
    } else if (activeDream) {
      // If clicking elsewhere and a dream is active, deselect it
      displayDreamDetails(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>): void => {
    e.preventDefault();

    // Zoom in or out based on wheel direction
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev * 1.1, 3));
    } else {
      setZoomLevel(prev => Math.max(prev / 1.1, 0.5));
    }

    // Adjust pan to zoom toward mouse position
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate new offset to keep the point under the mouse fixed
      setPanOffset(prev => {
        const zoomRatio = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        return {
          x: mouseX - (mouseX - prev.x) * zoomRatio,
          y: mouseY - (mouseY - prev.y) * zoomRatio,
        };
      });
    }
  };

  // Create a dream detail card component for portal
  const DreamDetailCard = (): React.ReactNode => {
    const dream = activeDream || hoveredDream;
    if (!dream) return null;

    // Use different positioning for fullscreen vs normal mode
    const cardStyle = isFullscreen
      ? {
          // In fullscreen, use absolute positioning relative to the container
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
        }
      : {
          // In normal mode, use fixed positioning relative to viewport
          position: 'fixed' as const,
          top: `${detailCardPosition.y}px`,
          left: `${detailCardPosition.x}px`,
          transform: 'translate(-50%, -120%)',
          zIndex: 9999,
        };

    return (
      <div
        className={`${styles.dreamDetailCard} ${showDetailCard ? styles.dreamDetailCardVisible : ''}`}
        ref={detailCardRef}
        style={cardStyle}
      >
        <button className={styles.closeDetailButton} onClick={() => displayDreamDetails(null)}>
          ×
        </button>

        <h2 className={styles.dreamDetailTitle}>{dream.title}</h2>

        <div
          className={styles.dreamDetailCategory}
          style={{
            backgroundColor: getCategoryColor(dream.category),
          }}
        >
          {dream.category}
        </div>

        <p className={styles.dreamDetailDescription}>{dream.description}</p>

        <div className={styles.dreamDetailProgress}>
          <div className={styles.dreamDetailProgressHeader}>
            <div className={styles.dreamDetailProgressLabel}>Progress</div>
            <div className={styles.dreamDetailProgressValue}>
              {Math.round(dream.progress * 100)}%
            </div>
          </div>
          <div className={styles.dreamDetailProgressBar}>
            <div
              className={styles.dreamDetailProgressFill}
              style={{
                width: `${dream.progress * 100}%`,
                backgroundColor: getCategoryColor(dream.category),
              }}
            />
          </div>
        </div>

        <div className={styles.dreamDetailMilestonesHeader}>
          <h3 className={styles.dreamDetailMilestonesTitle}>Milestones</h3>
          <div className={styles.dreamDetailMilestonesSummary}>
            {dream.milestones.filter(m => m.completed).length} of {dream.milestones.length}{' '}
            completed
          </div>
        </div>

        <div className={styles.dreamDetailMilestones}>
          {dream.milestones.map(milestone => (
            <div
              key={milestone.id}
              className={`${styles.dreamDetailMilestone} ${milestone.completed ? styles.completedMilestone : ''}`}
            >
              <div className={styles.milestoneCheckbox}>
                {milestone.completed && (
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneName}>{milestone.title}</div>
                {milestone.date && (
                  <div className={styles.milestoneDate}>{formatDate(milestone.date)}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {dream.isShared && (
          <div className={styles.dreamDetailSharing}>
            <div className={styles.dreamDetailSharingHeader}>
              <h3 className={styles.dreamDetailSharingTitle}>Shared With</h3>
            </div>
            <div className={styles.dreamDetailAvatars}>
              {dream.sharedWith?.map((userId, index) => (
                <div
                  key={userId}
                  className={styles.dreamDetailAvatar}
                  style={{ zIndex: 10 - index }}
                >
                  {userId.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.dreamDetailFooter}>
          <div className={styles.dreamDetailTimeframe}>
            {dream.timeframe
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </div>
          <div className={styles.dreamDetailCreated}>
            Created: {formatDate(dream.createdAt || '')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.cosmicContainer} ${isFullscreen ? styles.fullscreenMode : ''}`}
      ref={containerRef}
    >
      {isInitialized ? (
        <>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={dimensions.width}
            height={dimensions.height}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          />

          {/* Header Controls */}
          <div className={styles.header}>
            <h2 className={styles.title}>Dream Universe</h2>
            <div className={styles.controls}>
              <div className={styles.viewModeToggle}>
                <button
                  className={`${styles.viewModeButton} ${viewMode === 'cosmic' ? styles.activeViewMode : ''}`}
                  onClick={() => setViewMode('cosmic')}
                >
                  Cosmic
                </button>
                <button
                  className={`${styles.viewModeButton} ${viewMode === 'constellation' ? styles.activeViewMode : ''}`}
                  onClick={() => setViewMode('constellation')}
                >
                  Constellation
                </button>
              </div>

              <button
                className={styles.fullscreenButton}
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className={styles.navigationControls}>
            <div className={styles.zoomControls}>
              <button className={styles.controlButton} onClick={handleZoomOut} title="Zoom Out">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M19 13H5v-2h14v2z" fill="currentColor" />
                </svg>
              </button>

              <button className={styles.controlButton} onClick={handleResetView} title="Reset View">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <button className={styles.controlButton} onClick={handleZoomIn} title="Zoom In">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div className={styles.categorySelector}>
              <span className={styles.categoryLabel}>Category:</span>
              <select
                className={styles.categoryDropdown}
                value={selectedCategory}
                onChange={handleCategorySelect}
              >
                <option value="all">All Categories</option>
                {displayCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Legend */}
          <div className={styles.categoryLegend}>
            <div className={styles.legendTitle}>Dream Categories</div>
            <div className={styles.legendItems}>
              {displayCategories.map(category => {
                const count = dreams.filter(d => normalizeCategory(d.category) === category).length;
                return (
                  <div
                    key={category}
                    className={styles.legendItem}
                    style={{
                      opacity:
                        selectedCategory === 'all' || selectedCategory === category ? 1 : 0.5,
                    }}
                  >
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <div className={styles.legendLabel}>
                      {category}
                      <span className={styles.legendCount}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Use Portal for Dream Detail Card */}
          {showPortalCard &&
            createPortal(
              <DreamDetailCard />,
              isFullscreen && containerRef.current ? containerRef.current : document.body
            )}
        </>
      ) : (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Initializing Dream Universe...</div>
        </div>
      )}

      {dreams.length === 0 && (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIcon}>✨</div>
          <div className={styles.emptyStateText}>
            Your dream universe is empty.
            <br />
            Start by adding your first dream.
          </div>
          <button className={styles.addDreamButton}>Add Your First Dream</button>
        </div>
      )}
    </div>
  );
};
