"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { COLORS } from "@/lib/colors";

function FloatingPanel({ position, title, subtitle, color, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  // Determine reduced motion once
  const prefersReducedMotion = useMemo(() => {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state, delta) => {
    // 1. Hover Scale & Lift (Z)
    if (groupRef.current) {
      if (prefersReducedMotion) {
        groupRef.current.scale.set(1, 1, 1);
        groupRef.current.position.z = 0;
      } else {
        const targetScale = hovered ? 1.06 : 1.0;
        const targetZ = hovered ? 0.4 : 0.0;
        // Interpolate smoothly (delta * 8 gives ~200-300ms ease)
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 8);
      }
    }
    
    // 2. Idle Animation (Float)
    if (innerRef.current && !prefersReducedMotion) {
      innerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 0.5) * 0.12;
    } else if (innerRef.current) {
      innerRef.current.position.y = 0;
    }
    
    // 3. Emissive Intensity (Brightness)
    if (meshRef.current) {
      const targetIntensity = hovered ? 0.55 : 0.35;
      if (prefersReducedMotion) {
        meshRef.current.material.emissiveIntensity = targetIntensity;
      } else {
        meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
          meshRef.current.material.emissiveIntensity,
          targetIntensity,
          delta * 8
        );
      }
    }
  });

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; setHovered(false); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <group ref={innerRef}>
          <RoundedBox ref={meshRef} args={[3.2, 2.2, 0.2]} radius={0.15} smoothness={4}>
            <meshStandardMaterial 
              color="#0f172a" 
              roughness={0.6} 
              metalness={0}
              emissive={color}
              emissiveIntensity={0.35}
            />
          </RoundedBox>
          
          <Text
            position={[0, 0.3, 0.11]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.8}
            textAlign="center"
          >
            {title}
          </Text>
          
          <Text
            position={[0, -0.4, 0.11]}
            fontSize={0.2}
            color="#cbd5e1"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.8}
            textAlign="center"
          >
            {subtitle}
          </Text>
        </group>
      </group>
      
      {/* Grounding soft shadow */}
      <mesh position={[0, -2.5, -0.5]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.35, 1]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SceneGroup({ isAnimating, onAnimationComplete }: { isAnimating: boolean, onAnimationComplete: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const targetCameraPos = useMemo(() => new THREE.Vector3(0, 0, -2), []);

  useFrame((state, delta) => {
    if (groupRef.current && !isAnimating) {
      // More dynamic 3D rotation
      groupRef.current.rotation.y += delta * 0.15; 
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Slight vertical bobbing of the whole group
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }

    if (isAnimating) {
      // Camera dives deeply into the scene
      camera.position.lerp(targetCameraPos, delta * 3.5);
      
      if (groupRef.current) {
        // Explode outwards and spin
        groupRef.current.rotation.y += delta * 3.5;
        groupRef.current.rotation.z += delta * 1.5;
        
        // Expand the group size so panels fly off screen
        groupRef.current.scale.lerp(new THREE.Vector3(5, 5, 5), delta * 2.5);
      }
      
      // Fire transition when camera passes through or gets close enough
      if (camera.position.z < 3.0) {
        onAnimationComplete();
      }
    } else {
      // Gentle parallax effect tied to mouse
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, (state.mouse.x * 2.5), delta * 2);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, (state.mouse.y * 2.5), delta * 2);
      camera.lookAt(0, 0, 0);
    }
  });

  const panels = [
    { title: "Accounts", subtitle: "Track real-time balances", color: COLORS[0], pos: [-4.2, 1.8, 0] },
    { title: "Transactions", subtitle: "Monitor every cent", color: COLORS[1], pos: [4.2, 1.8, -1.5] },
    { title: "Categories", subtitle: "Organize your spending", color: COLORS[2], pos: [-2.8, -2.5, 1.5] },
    { title: "AI Insights", subtitle: "Smarter financial decisions", color: COLORS[3], pos: [2.8, -2.5, 2.5] },
  ];

  return (
    <group ref={groupRef}>
      {panels.map((p, i) => (
        <FloatingPanel 
          key={i} 
          position={p.pos} 
          title={p.title}
          subtitle={p.subtitle}
          color={p.color} 
          onClick={() => {}} // parent handles click
        />
      ))}
    </group>
  );
}

export default function LandingScene({ onComplete }: { onComplete: () => void }) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handlePanelClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      document.body.style.cursor = 'auto'; // Reset cursor
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 14], fov: 35 }} onPointerDown={handlePanelClick}>
      <color attach="background" args={['#090e17']} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color={COLORS[0]} />
      <pointLight position={[10, -10, 10]} intensity={0.8} color={COLORS[1]} />

      <Suspense fallback={null}>
        <SceneGroup isAnimating={isAnimating} onAnimationComplete={onComplete} />
        
        <Sparkles count={150} scale={20} size={3} speed={0.4} opacity={0.3} color={COLORS[3]} />
        <Sparkles count={150} scale={20} size={2} speed={0.2} opacity={0.2} color={COLORS[2]} />
        

      </Suspense>
    </Canvas>
  );
}
