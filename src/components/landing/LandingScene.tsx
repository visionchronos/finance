"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function FloatingPanel({ position, title, subtitle, color, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.05 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    }
    if (meshRef.current) {
      const hoverPulse = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      const targetIntensity = hovered ? hoverPulse : 0.2;
      meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        meshRef.current.material.emissiveIntensity,
        targetIntensity,
        delta * 5
      );
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2} position={position}>
      <group
        ref={groupRef}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; setHovered(false); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <RoundedBox ref={meshRef} args={[3.4, 2.4, 0.15]} radius={0.15} smoothness={2}>
          <meshStandardMaterial 
            color="#1e293b" 
            roughness={0.1} 
            metalness={0.9}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </RoundedBox>
        
        <Html transform position={[0, 0, 0.08]} center pointerEvents="none">
          <div className="flex flex-col items-center justify-center w-56 text-center select-none drop-shadow-xl">
            <div 
              className="text-2xl font-extrabold mb-1 tracking-tight" 
              style={{ color: 'white', textShadow: `0 0 15px ${color}` }}
            >
              {title}
            </div>
            <div className="text-sm font-medium text-slate-200">
              {subtitle}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function SceneGroup({ isAnimating, onAnimationComplete }: { isAnimating: boolean, onAnimationComplete: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const targetCameraPos = useMemo(() => new THREE.Vector3(0, 0, 0.5), []);

  useFrame((state, delta) => {
    if (groupRef.current && !isAnimating) {
      // Gentle orbit rotation
      groupRef.current.rotation.y += delta * 0.15; 
      // Slight vertical bobbing of the whole group
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    if (isAnimating) {
      // Accelerate camera into the scene
      camera.position.lerp(targetCameraPos, delta * 3.5);
      
      // More forgiving distance check to ensure transition fires
      if (camera.position.distanceTo(targetCameraPos) < 1.0) {
        onAnimationComplete();
      }
    } else {
      // Gentle parallax effect tied to mouse
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, (state.mouse.x * 2.5), 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, (state.mouse.y * 2.5), 0.05);
      camera.lookAt(0, 0, 0);
    }
  });

  const panels = [
    { title: "Accounts", subtitle: "Track real-time balances", color: "#10b981", pos: [-3.8, 1.8, 0] }, // Cool tones for accounts/saving
    { title: "Transactions", subtitle: "Monitor every cent", color: "#f59e0b", pos: [3.8, 1.8, -1.5] }, // Warm tones for spending
    { title: "Categories", subtitle: "Organize your spending", color: "#ef4444", pos: [-2.5, -2.5, 1.5] }, // Warm for categories
    { title: "AI Insights", subtitle: "Smarter financial decisions", color: "#8b5cf6", pos: [2.5, -2.5, 2.5] },
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
    <Canvas camera={{ position: [0, 0, 9], fov: 45 }} onPointerDown={handlePanelClick}>
      <color attach="background" args={['#0f172a']} />
      
      {/* Performant directional & point lights instead of heavy HDRI Environment */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#4f46e5" />
      <pointLight position={[10, -10, 10]} intensity={2} color="#0ea5e9" />

      {/* Suspense boundary prevents entire canvas from going blank if fonts/textures load */}
      <Suspense fallback={null}>
        <SceneGroup isAnimating={isAnimating} onAnimationComplete={onComplete} />
        <Sparkles count={300} scale={20} size={2} speed={0.2} opacity={0.3} color="white" />
      </Suspense>
    </Canvas>
  );
}
