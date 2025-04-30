import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { OrbitControls, Text, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_LIFE_CATEGORIES } from '../../../constants/categories';
import styles from '../../WelcomeSequence.module.css';
import { LifeCategory } from '../../../types';
import { Mesh, Group } from 'three';

// Visual stage type that matches our message sequence
type VisualStage =
  | 'intro'
  | 'platform-1'
  | 'platform-2'
  | 'wheel-intro-1'
  | 'wheel-intro-2'
  | 'segments-1'
  | 'segments-2'
  | 'completion'
  | 'benefits-1'
  | 'benefits-2'
  | 'benefits-3'
  | 'benefits-4'
  | 'finale';

interface LifeWheelVisualizationProps {
  currentStage: VisualStage;
  currentIndex: number;
}

interface WheelSegmentProps {
  index: number;
  category: LifeCategory;
  isActive: boolean;
  totalSegments: number;
  radius?: number;
}

interface PlatformBenefitProps {
  position: [number, number, number];
  icon: string;
  label: string;
  isActive: boolean;
  index: number;
}

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  isActive: boolean;
  color: string;
}

interface VisualizationSceneProps {
  currentStage: VisualStage;
  currentIndex: number;
}

// Individual wheel segment that animates in
const WheelSegment = ({
  index,
  category,
  isActive,
  totalSegments,
  radius = 3,
}: WheelSegmentProps): JSX.Element => {
  // Calculate angle for this segment
  const angleStep = (2 * Math.PI) / totalSegments;
  const startAngle = index * angleStep - Math.PI / 2;
  const endAngle = startAngle + angleStep;

  // Create proper THREE.js Shape
  const shape = new THREE.Shape();
  const innerRadius = radius * 0.4;

  // Start at outer radius
  shape.moveTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));

  // Draw outer arc
  for (let angle = startAngle; angle <= endAngle; angle += angleStep / 10) {
    shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
  }

  // Connect to inner radius
  shape.lineTo(innerRadius * Math.cos(endAngle), innerRadius * Math.sin(endAngle));

  // Draw inner arc
  for (let angle = endAngle; angle >= startAngle; angle -= angleStep / 10) {
    shape.lineTo(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle));
  }

  // Close the shape
  shape.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));

  // Extract color from gradient for simplicity
  const gradientColor = category.gradient.match(/#[0-9a-f]{6}/i)?.[0] || '#8B5CF6';

  // Animation spring
  const { scale, opacity, positionZ } = useSpring({
    scale: isActive ? 1 : 0.5,
    opacity: isActive ? 1 : 0.1,
    positionZ: isActive ? 0 : -2,
    config: { mass: 2, tension: 170, friction: 26 },
  });

  // Text position at center of segment
  const textAngle = startAngle + angleStep / 2;
  const textRadius = radius * 0.7;
  const textPosition = [
    textRadius * Math.cos(textAngle),
    textRadius * Math.sin(textAngle),
    0.1,
  ] as [number, number, number];

  // Segment animation
  const meshRef = useRef<Mesh>(null);
  useFrame(state => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.03;
    }
  });

  return (
    <animated.group scale={scale} position-z={positionZ}>
      <mesh ref={meshRef}>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.2,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 3,
            },
          ]}
        />
        <animated.meshPhongMaterial
          color={gradientColor}
          opacity={opacity}
          transparent={true}
          shininess={30}
          specular={0xffffff}
        />
      </mesh>

      {isActive && (
        <Text
          position={textPosition}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
        >
          {category.name}
        </Text>
      )}
    </animated.group>
  );
};

// Platform benefit visualization
const PlatformBenefit = ({
  position,
  label,
  isActive,
  index,
}: PlatformBenefitProps): JSX.Element => {
  const { scale, opacity } = useSpring({
    scale: isActive ? 1 : 0.1,
    opacity: isActive ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  // Hover animation
  const meshRef = useRef<Group>(null);

  useFrame(state => {
    if (meshRef.current && isActive) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.8 + index * 1.5) * 0.003;
    }
  });

  return (
    <animated.group position={position} scale={scale} ref={meshRef}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <animated.meshPhongMaterial
          color={index % 2 === 0 ? '#8B5CF6' : '#EC4899'}
          opacity={opacity}
          transparent={true}
          shininess={50}
        />
      </mesh>

      {isActive && (
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="top"
          maxWidth={2}
        >
          {label}
        </Text>
      )}
    </animated.group>
  );
};

// Connection line between wheel and benefits
const ConnectionLine = ({ start, end, isActive, color }: ConnectionLineProps): JSX.Element => {
  const { opacity, width } = useSpring({
    opacity: isActive ? 0.8 : 0,
    width: isActive ? 0.05 : 0.01,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Create a curve for the connection line
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3(
      (start[0] + end[0]) * 0.5,
      (start[1] + end[1]) * 0.5,
      (start[2] + end[2]) * 0.5 + 2 // Add some curve height
    ),
    new THREE.Vector3(...end)
  );

  // Create geometry from the curve
  const points = curve.getPoints(20);

  return (
    <Line
      points={points}
      color={color}
      opacity={opacity.get()}
      transparent
      lineWidth={width.get()}
      derivatives={false}
    />
  );
};

// Main visualization scene
const VisualizationScene = ({
  currentStage,
  currentIndex,
}: VisualizationSceneProps): JSX.Element => {
  // Determine which segments should be active based on current stage
  const getActiveSegments = (): number[] => {
    switch (currentStage) {
      case 'intro':
      case 'platform-1':
      case 'platform-2':
        return []; // No segments active yet
      case 'wheel-intro-1':
      case 'wheel-intro-2':
        return [0]; // Just first segment
      case 'segments-1':
      case 'segments-2': {
        // Progressively reveal segments based on index
        const maxSegments = Math.min(
          Math.floor((currentIndex - 2) * 2), // Start showing from message 3
          DEFAULT_LIFE_CATEGORIES.length
        );
        return Array.from({ length: maxSegments }, (_, i) => i);
      }
      case 'completion':
      case 'benefits-1':
      case 'benefits-2':
      case 'benefits-3':
      case 'benefits-4':
      case 'finale':
        // All segments active
        return Array.from({ length: DEFAULT_LIFE_CATEGORIES.length }, (_, i) => i);
      default:
        return [];
    }
  };

  // Platform benefits
  const benefits = [
    {
      id: 'personalized',
      icon: '👤',
      label: 'Personalized Journey',
      position: [5, 0, 0] as [number, number, number],
    },
    {
      id: 'community',
      icon: '👥',
      label: 'Supportive Community',
      position: [3.5, 3.5, 0] as [number, number, number],
    },
    {
      id: 'resources',
      icon: '📚',
      label: 'Expert Resources',
      position: [0, 5, 0] as [number, number, number],
    },
    {
      id: 'tracking',
      icon: '📈',
      label: 'Progress Tracking',
      position: [-3.5, 3.5, 0] as [number, number, number],
    },
    {
      id: 'coaching',
      icon: '🔍',
      label: 'Guided Exploration',
      position: [-5, 0, 0] as [number, number, number],
    },
  ];

  // Determine which benefits are active
  const getActiveBenefits = (): number[] => {
    switch (currentStage) {
      case 'benefits-1':
        return [0];
      case 'benefits-2':
        return [0, 1, 2];
      case 'benefits-3':
      case 'benefits-4':
      case 'finale':
        return [0, 1, 2, 3, 4];
      default:
        return [];
    }
  };

  // Logo animation state
  const [logoScale, setLogoScale] = useState(1);
  const [logoOpacity, setLogoOpacity] = useState(1);

  // Update logo animation based on stage
  useEffect(() => {
    if (currentStage === 'intro') {
      setLogoScale(1);
      setLogoOpacity(1);
    } else if (currentStage === 'platform-1' || currentStage === 'platform-2') {
      setLogoScale(0.5);
      setLogoOpacity(0.7);
    } else {
      setLogoScale(0);
      setLogoOpacity(0);
    }
  }, [currentStage]);

  // Whole wheel rotation animation
  const wheelRef = useRef<Group>(null);

  useFrame(state => {
    if (wheelRef.current) {
      // Gentle floating animation
      wheelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;

      // Different rotation speeds based on stage
      if (
        ['intro', 'platform-1', 'platform-2', 'wheel-intro-1', 'wheel-intro-2'].includes(
          currentStage
        )
      ) {
        wheelRef.current.rotation.y += 0.002;
      } else if (currentStage === 'segments-1' || currentStage === 'segments-2') {
        wheelRef.current.rotation.y += 0.001;
      } else {
        wheelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      }
    }
  });

  const activeSegments = getActiveSegments();
  const activeBenefits = getActiveBenefits();

  return (
    <>
      {/* Moving camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

      {/* Ambient light */}
      <ambientLight intensity={0.6} />

      {/* Main directional light */}
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />

      {/* Accent lights for dramatic effect */}
      <pointLight position={[-5, 2, 3]} intensity={0.5} color="#8B5CF6" />
      <pointLight position={[5, -2, 3]} intensity={0.5} color="#EC4899" />

      {/* We Better Logo (shown in intro stages) */}
      <animated.group position={[0, 0, 2]} scale={logoScale} visible={logoOpacity > 0}>
        <Text fontSize={1} color="#ffffff" anchorX="center" anchorY="middle">
          We Better
        </Text>
      </animated.group>

      {/* Life Wheel Group */}
      <group ref={wheelRef}>
        {DEFAULT_LIFE_CATEGORIES.map((category, index) => (
          <WheelSegment
            key={category.id}
            index={index}
            category={category}
            isActive={activeSegments.includes(index)}
            totalSegments={DEFAULT_LIFE_CATEGORIES.length}
          />
        ))}
      </group>

      {/* Platform Benefits */}
      {benefits.map((benefit, index) => (
        <PlatformBenefit
          key={benefit.id}
          position={benefit.position}
          icon={benefit.icon}
          label={benefit.label}
          isActive={activeBenefits.includes(index)}
          index={index}
        />
      ))}

      {/* Connection lines */}
      {benefits.map(
        (benefit, index) =>
          activeSegments.length > 0 &&
          activeBenefits.includes(index) && (
            <ConnectionLine
              key={`connection-${index}`}
              start={[0, 0, 0]}
              end={benefit.position}
              isActive={activeBenefits.includes(index)}
              color={index % 2 === 0 ? '#8B5CF6' : '#EC4899'}
            />
          )
      )}

      {/* Limited orbit controls for interactivity */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
};

// Simplified test component
const LifeWheelVisualization = ({
  currentStage,
  currentIndex,
}: LifeWheelVisualizationProps): JSX.Element => {
  return (
    <div className={styles.visualizationContainer}>
      <Suspense
        fallback={
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              background: 'rgba(0,0,0,0.5)',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            Loading 3D Scene...
          </div>
        }
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 75 }}
          style={{
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          <VisualizationScene currentStage={currentStage} currentIndex={currentIndex} />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default LifeWheelVisualization;
