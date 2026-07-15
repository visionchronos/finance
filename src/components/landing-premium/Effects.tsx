"use client";

import { useMemo } from "react";
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function Effects({ progressRef }: { progressRef: React.MutableRefObject<{b: number, c: number, transition: number}> }) {
  const chromAbRef = useRef<any>(null);
  
  // Base offset vector
  const baseOffset = useMemo(() => new THREE.Vector2(0.001, 0.001), []);
  
  useFrame(() => {
    if (chromAbRef.current) {
      // Scale chromatic aberration by transition intensity
      const strength = 0.001 + (progressRef.current.transition * 0.008);
      chromAbRef.current.offset.set(strength, strength);
    }
  });

  return (
    <EffectComposer disableNormalPass>
      {/* Bloom specifically targeted via high luminanceThreshold, so only our "hot" particles bloom */}
      <Bloom 
        luminanceThreshold={1.0} 
        mipmapBlur 
        intensity={2.0} 
      />
      
      <ChromaticAberration 
        ref={chromAbRef}
        blendFunction={BlendFunction.NORMAL} 
        offset={baseOffset} 
      />
      
      {/* Film grain */}
      <Noise opacity={0.08} blendFunction={BlendFunction.OVERLAY} />
      
      <Vignette eskil={false} offset={0.1} darkness={1.3} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
