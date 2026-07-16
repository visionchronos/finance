"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshTransmissionMaterial, Environment, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// Colors from the prompt
const MINT = "#00FFA3";
const LAVENDER = "#C4B5FD";

function CameraRig() {
  useFrame((state) => {
    // Slow Lissajous pattern
    const t = state.clock.elapsedTime * 0.2;
    state.camera.position.x = Math.sin(t) * 1.5;
    state.camera.position.y = Math.cos(t * 0.8) * 1.0;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function FloatingObjects() {
  const { viewport } = useThree();
  
  // Shift everything right and back so it doesn't obscure left-aligned text
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[viewport.width > 5 ? 4 : 2, 0, -3]}>
      {/* 3x Floating Coins */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={[-2, 2, -2]}>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <cylinderGeometry args={[1, 1, 0.14, 64]} />
          <meshPhysicalMaterial metalness={1} roughness={0.18} clearcoat={1} color="#222" />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5} position={[2, 1, -4]}>
        <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <cylinderGeometry args={[1, 1, 0.14, 64]} />
          <meshPhysicalMaterial metalness={1} roughness={0.18} clearcoat={1} color="#333" />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={1} floatIntensity={2.5} position={[0, -2, -1]}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 8, 0]}>
          <cylinderGeometry args={[1, 1, 0.14, 64]} />
          <meshPhysicalMaterial metalness={1} roughness={0.18} clearcoat={1} color="#111" />
        </mesh>
      </Float>

      {/* 2x Torus Knots */}
      <Float speed={1} rotationIntensity={3} floatIntensity={3} position={[-3, -1, -5]}>
        <mesh>
          <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
          <MeshDistortMaterial distort={0.35} color={MINT} emissive={MINT} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={2} floatIntensity={2} position={[3, -2, -3]}>
        <mesh>
          <torusKnotGeometry args={[0.7, 0.2, 128, 32]} />
          <MeshDistortMaterial distort={0.35} color={LAVENDER} emissive={LAVENDER} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>

      {/* 2x Icosahedrons (Glass) */}
      <Float speed={1.8} rotationIntensity={1} floatIntensity={2} position={[1, 3, -6]}>
        <mesh>
          <icosahedronGeometry args={[1.5, 0]} />
          <MeshTransmissionMaterial transmission={1} ior={1.4} thickness={0.5} roughness={0} chromaticAberration={0.05} />
        </mesh>
      </Float>
      <Float speed={2.2} rotationIntensity={1.5} floatIntensity={1.5} position={[-1, -3, -4]}>
        <mesh>
          <icosahedronGeometry args={[1.2, 0]} />
          <MeshTransmissionMaterial transmission={1} ior={1.4} thickness={0.5} roughness={0} chromaticAberration={0.05} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
      <color attach="background" args={['#05050A']} />
      <fog attach="fog" args={['#05050A', 6, 14]} />
      
      {/* Lights */}
      <ambientLight intensity={0.25} />
      {/* Mint spotlight top-right */}
      <spotLight position={[5, 5, 5]} color={MINT} intensity={80} distance={20} angle={0.5} penumbra={1} />
      {/* Lavender spotlight bottom-left */}
      <spotLight position={[-5, -5, 5]} color={LAVENDER} intensity={60} distance={20} angle={0.5} penumbra={1} />
      <pointLight position={[0, 0, 5]} color="#ffffff" intensity={1} />
      
      <Environment preset="city" />
      
      <CameraRig />
      <FloatingObjects />
      
      <Sparkles count={150} scale={12} size={1.5} speed={0.4} color={MINT} opacity={0.2} />
      <Sparkles count={100} scale={12} size={1} speed={0.2} color={LAVENDER} opacity={0.2} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
}
