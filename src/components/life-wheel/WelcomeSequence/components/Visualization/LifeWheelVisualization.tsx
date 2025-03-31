import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { OrbitControls, Text, PerspectiveCamera, useFont } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_LIFE_CATEGORIES } from '../../../constants/categories';
import styles from '../../WelcomeSequence.module.css';

// Visual stage type that matches our message sequence
type VisualStage = 
  | 'intro' 
  | 'platform' 
  | 'wheel-intro' 
  | 'segments' 
  | 'completion' 
  | 'benefits-1' 
  | 'benefits-2' 
  | 'benefits-3' 
  | 'finale';

interface LifeWheelVisualizationProps {
  currentStage: VisualStage;
  currentIndex: number;
}

// Individual wheel segment that animates in
const WheelSegment = ({ 
  index, 
  category, 
  isActive, 
  totalSegments, 
  radius = 3 
}) => {
  // Calculate angle for this segment
  const angleStep = (2 * Math.PI) / totalSegments;
  const startAngle = index * angleStep - Math.PI / 2;
  const endAngle = startAngle + angleStep;
  
  // Create proper THREE.js Shape
  const shape = new THREE.Shape();
  const innerRadius = radius * 0.4;
  
  // Start at outer radius
  shape.moveTo(
    radius * Math.cos(startAngle), 
    radius * Math.sin(startAngle)
  );
  
  // Draw outer arc
  for (let angle = startAngle; angle <= endAngle; angle += angleStep / 10) {
    shape.lineTo(
      radius * Math.cos(angle), 
      radius * Math.sin(angle)
    );
  }
  
  // Connect to inner radius
  shape.lineTo(
    innerRadius * Math.cos(endAngle), 
    innerRadius * Math.sin(endAngle)
  );
  
  // Draw inner arc
  for (let angle = endAngle; angle >= startAngle; angle -= angleStep / 10) {
    shape.lineTo(
      innerRadius * Math.cos(angle), 
      innerRadius * Math.sin(angle)
    );
  }
  
  // Close the shape
  shape.lineTo(
    radius * Math.cos(startAngle), 
    radius * Math.sin(startAngle)
  );
  
  // Extract color from gradient for simplicity
  const gradientColor = category.gradient.match(/#[0-9a-f]{6}/i)?.[0] || '#8B5CF6';
  
  // Animation spring
  const { scale, opacity, positionZ } = useSpring({
    scale: isActive ? 1 : 0.5,
    opacity: isActive ? 1 : 0.1,
    positionZ: isActive ? 0 : -2,
    config: { mass: 2, tension: 170, friction: 26 }
  });
  
  // Text position at center of segment
  const textAngle = startAngle + angleStep / 2;
  const textRadius = radius * 0.7;
  const textPosition = [
    textRadius * Math.cos(textAngle), 
    textRadius * Math.sin(textAngle), 
    0.1
  ];
  
  // Segment animation
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.03;
    }
  });
  
  return (
    <animated.group 
      scale={scale} 
      position-z={positionZ}
    >
      <mesh ref={meshRef}>
        <extrudeGeometry 
          args={[
            shape, 
            {
              depth: 0.2,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 3
            }
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
  icon, 
  label, 
  isActive, 
  index 
}) => {
  const { scale, opacity } = useSpring({
    scale: isActive ? 1 : 0.1,
    opacity: isActive ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Hover animation
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.8 + index * 1.5) * 0.003;
    }
  });
  
  return (
    <animated.group 
      position={position} 
      scale={scale} 
      ref={meshRef}
    >
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
const ConnectionLine = ({ start, end, isActive, color }) => {
  const { opacity, width } = useSpring({
    opacity: isActive ? 0.8 : 0,
    width: isActive ? 0.05 : 0.01,
    config: { mass: 1, tension: 170, friction: 26 }
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
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <animated.line geometry={geometry}>
      <animated.lineBasicMaterial 
        color={color} 
        opacity={opacity} 
        transparent={true} 
        linewidth={width} 
      />
    </animated.line>
  );
};

// Main visualization scene
const VisualizationScene = ({ currentStage, currentIndex }) => {
  // Determine which segments should be active based on current stage
  const getActiveSegments = () => {
    switch(currentStage) {
      case 'intro':
      case 'platform':
        return []; // No segments active yet
      case 'wheel-intro':
        return [0]; // Just first segment
      case 'segments':
        // Progressively reveal segments based on index
        const segmentsToShow = Math.min(
          Math.floor((currentIndex - 2) * 2), // Start showing from message 3
          DEFAULT_LIFE_CATEGORIES.length
        );
        return Array.from({ length: segmentsToShow }, (_, i) => i);
      case 'completion':
      case 'benefits-1':
      case 'benefits-2':
      case 'benefits-3':
      case 'finale':
        // All segments active
        return Array.from({ length: DEFAULT_LIFE_CATEGORIES.length }, (_, i) => i);
      default:
        return [];
    }
  };
  
  // Platform benefits
  const benefits = [
    { id: 'personalized', icon: '👤', label: 'Personalized Journey', position: [5, 0, 0] },
    { id: 'community', icon: '👥', label: 'Supportive Community', position: [3.5, 3.5, 0] },
    { id: 'resources', icon: '📚', label: 'Expert Resources', position: [0, 5, 0] },
    { id: 'tracking', icon: '📈', label: 'Progress Tracking', position: [-3.5, 3.5, 0] },
    { id: 'coaching', icon: '🔍', label: 'Guided Exploration', position: [-5, 0, 0] }
  ];
  
  // Determine which benefits are active
  const getActiveBenefits = () => {
    switch(currentStage) {
      case 'benefits-1':
        return [0];
      case 'benefits-2':
        return [0, 1, 2];
      case 'benefits-3':
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
    } else if (currentStage === 'platform') {
      setLogoScale(0.5);
      setLogoOpacity(0.7);
    } else {
      setLogoScale(0);
      setLogoOpacity(0);
    }
  }, [currentStage]);
  
  // Whole wheel rotation animation
  const wheelRef = useRef();
  useFrame((state) => {
    if (wheelRef.current) {
      // Gentle floating animation
      wheelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      
      // Different rotation speeds based on stage
      if (['intro', 'platform', 'wheel-intro'].includes(currentStage)) {
        wheelRef.current.rotation.y += 0.002;
      } else if (currentStage === 'segments') {
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
      <PerspectiveCamera 
        makeDefault 
        position={[0, 0, 10]} 
        fov={50}
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.6} />
      
      {/* Main directional light */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow 
      />
      
      {/* Accent lights for dramatic effect */}
      <pointLight position={[-5, 2, 3]} intensity={0.5} color="#8B5CF6" />
      <pointLight position={[5, -2, 3]} intensity={0.5} color="#EC4899" />
      
      {/* We Better Logo (shown in intro stages) */}
      <animated.group 
        position={[0, 0, 2]} 
        scale={logoScale} 
        opacity={logoOpacity}
      >
        <Text
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
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
      {benefits.map((benefit, index) => (
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
      ))}
      
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

// Update the test scene
const TestScene = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#8B5CF6" intensity={0.5} />
      
      <group position={[0, 0, -2]}>
        <mesh ref={meshRef} scale={1.5}>
          <torusKnotGeometry args={[1, 0.3, 128, 16]} />
          <meshStandardMaterial
            color="#EC4899"
            metalness={0.5}
            roughness={0.3}
            emissive="#8B5CF6"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Add some particles or stars in the background */}
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent
              opacity={Math.random() * 0.5 + 0.3}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};

// Simplified test component
const LifeWheelVisualization = ({ currentStage, currentIndex }: LifeWheelVisualizationProps) => {
  return (
    <div className={styles.visualizationContainer}>
      <Suspense fallback={
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          background: 'rgba(0,0,0,0.5)',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          Loading 3D Scene...
        </div>
      }>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 75 }}
          style={{ 
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        >
          <VisualizationScene currentStage={currentStage} currentIndex={currentIndex} />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default LifeWheelVisualization; 