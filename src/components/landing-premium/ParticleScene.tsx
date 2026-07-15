"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleMesh } from "./ParticleMesh";
import { Effects } from "./Effects";

// Ambient horizon plane
function HorizonPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Basic vertex displacement by modifying rotation or position slightly if needed
      // For a simple sine displacement without custom shaders, we can just bob it
      meshRef.current.position.y = -3 + Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -3, -5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50, 32, 32]} />
      <meshStandardMaterial 
        color="#040914" 
        wireframe={true} 
        transparent 
        opacity={0.15} 
      />
    </mesh>
  );
}

// Background shards
function BackgroundShards() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10 - 10
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <tetrahedronGeometry args={[Math.random() * 2 + 0.5]} />
          <meshBasicMaterial color="#0c162d" wireframe={true} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export interface ProgressState {
  b: number;
  c: number;
  transition: number;
}

export function ParticleScene({ progressRef }: { progressRef: React.MutableRefObject<ProgressState> }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', 5, 25]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      
      <Suspense fallback={null}>
        <ParticleMesh progressRef={progressRef} />
        <Effects progressRef={progressRef} />
        <HorizonPlane />
        <BackgroundShards />
      </Suspense>
    </Canvas>
  );
}
