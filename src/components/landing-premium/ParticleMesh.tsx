"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Number of particles
const PARTICLE_COUNT = 8000;

// Helper to generate points on the edges of an icosahedron
function getIcosahedronEdges(count: number): Float32Array {
  const geom = new THREE.IcosahedronGeometry(1.5, 0);
  const posAttr = geom.attributes.position;
  const indices = geom.index?.array;
  
  const edges: { a: THREE.Vector3, b: THREE.Vector3 }[] = [];
  
  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(posAttr, indices[i]);
      const b = new THREE.Vector3().fromBufferAttribute(posAttr, indices[i+1]);
      const c = new THREE.Vector3().fromBufferAttribute(posAttr, indices[i+2]);
      edges.push({a, b}, {a: b, b: c}, {a: c, b: a});
    }
  } else {
    // Fallback for non-indexed geometry
    for (let i = 0; i < posAttr.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const b = new THREE.Vector3().fromBufferAttribute(posAttr, i+1);
      const c = new THREE.Vector3().fromBufferAttribute(posAttr, i+2);
      edges.push({a, b}, {a: b, b: c}, {a: c, b: a});
    }
  }

  const positions = new Float32Array(count * 3);
  
  if (edges.length === 0) {
    // Ultimate fallback if geometry parsing fails completely
    console.warn("Failed to extract edges from IcosahedronGeometry");
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }

  for (let i = 0; i < count; i++) {
    // Pick random edge
    const edge = edges[Math.floor(Math.random() * edges.length)];
    // Random point along edge
    const t = Math.random();
    const pt = new THREE.Vector3().lerpVectors(edge.a, edge.b, t);
    
    // Add jitter
    pt.x += (Math.random() - 0.5) * 0.2;
    pt.y += (Math.random() - 0.5) * 0.2;
    pt.z += (Math.random() - 0.5) * 0.2;

    positions[i * 3] = pt.x;
    positions[i * 3 + 1] = pt.y;
    positions[i * 3 + 2] = pt.z;
  }
  
  return positions;
}

// Helper to sample pixels from a 2D canvas drawing
function sampleFromCanvas(drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void, count: number): Float32Array {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) return new Float32Array(count * 3);
  
  // Clear black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);
  
  drawFn(ctx, size, size);
  
  const imgData = ctx.getImageData(0, 0, size, size).data;
  const validPixels: {x: number, y: number}[] = [];
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const r = imgData[idx];
      // If pixel is somewhat bright, it's valid
      if (r > 50) {
        validPixels.push({ x, y });
      }
    }
  }
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (validPixels.length === 0) break;
    // Pick random valid pixel
    const p = validPixels[Math.floor(Math.random() * validPixels.length)];
    
    // Map to 3D space: x ranges from -2.5 to 2.5, y from 2.5 to -2.5
    // Add slight random z depth
    positions[i * 3] = (p.x / size - 0.5) * 5;
    positions[i * 3 + 1] = -(p.y / size - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  
  return positions;
}

// State B: Chart Silhouette
function drawChart(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.8);
  ctx.lineTo(w * 0.3, h * 0.7);
  ctx.lineTo(w * 0.5, h * 0.75);
  ctx.lineTo(w * 0.7, h * 0.4);
  ctx.lineTo(w * 0.9, h * 0.2);
  ctx.stroke();
  
  // Bar chart below
  ctx.fillStyle = 'white';
  ctx.fillRect(w * 0.1, h * 0.8, w * 0.15, h * 0.1);
  ctx.fillRect(w * 0.3, h * 0.7, w * 0.15, h * 0.2);
  ctx.fillRect(w * 0.5, h * 0.75, w * 0.15, h * 0.15);
  ctx.fillRect(w * 0.7, h * 0.4, w * 0.15, h * 0.5);
}

// State C: Logo/Geometric Mark
function drawLogo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 20;
  // Interlocking shapes / abstract "F"
  ctx.strokeRect(w * 0.3, h * 0.3, w * 0.4, h * 0.4);
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, w * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

const vertexShader = `
  attribute vec3 targetB;
  attribute vec3 targetC;
  attribute vec3 colorIntensity;

  uniform float uProgressB;
  uniform float uProgressC;
  uniform float uTime;

  varying vec3 vColorIntensity;

  void main() {
    vColorIntensity = colorIntensity;

    // Morphing logic
    vec3 pos = position;
    
    // Mix to State B
    pos = mix(pos, targetB, uProgressB);
    
    // Mix to State C
    pos = mix(pos, targetC, uProgressC);
    
    // Add some gentle noise/floating
    pos.y += sin(uTime * 2.0 + pos.x * 5.0) * 0.02;
    pos.x += cos(uTime * 1.5 + pos.y * 5.0) * 0.02;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // Dynamic point size based on depth
    gl_PointSize = (8.0 * vColorIntensity.x) * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColorIntensity;

  void main() {
    // Soft circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    float alpha = (0.5 - ll) * 2.0;
    
    // Base color (pale blue/white) multiplied by intensity for bloom
    vec3 baseColor = vec3(0.6, 0.8, 1.0);
    vec3 finalColor = baseColor * vColorIntensity.x * 2.0; // Boost for HDR bloom
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function ParticleMesh({ progressRef }: { progressRef: React.MutableRefObject<{b: number, c: number, transition: number}> }) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const { posA, posB, posC, colorIntensity } = useMemo(() => {
    // Only generate on client
    if (typeof window === "undefined") {
      return { posA: new Float32Array(0), posB: new Float32Array(0), posC: new Float32Array(0), colorIntensity: new Float32Array(0) };
    }
    
    const count = PARTICLE_COUNT;
    const a = getIcosahedronEdges(count);
    const b = sampleFromCanvas(drawChart, count);
    const c = sampleFromCanvas(drawLogo, count);
    
    const intensity = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // 20% of particles are "hot" (for bloom on cracks/seams)
      const isHot = Math.random() > 0.8;
      intensity[i * 3] = isHot ? 3.0 : 0.5; // RGB channels (we just use X in shader)
      intensity[i * 3 + 1] = isHot ? 3.0 : 0.5;
      intensity[i * 3 + 2] = isHot ? 3.0 : 0.5;
    }
    
    return { posA: a, posB: b, posC: c, colorIntensity: intensity };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smooth out the incoming progress values slightly
      shaderRef.current.uniforms.uProgressB.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgressB.value, 
        progressRef.current.b, 
        0.1
      );
      shaderRef.current.uniforms.uProgressC.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgressC.value, 
        progressRef.current.c, 
        0.1
      );
    }
  });

  if (posA.length === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={posA} itemSize={3} />
        <bufferAttribute attach="attributes-targetB" count={PARTICLE_COUNT} array={posB} itemSize={3} />
        <bufferAttribute attach="attributes-targetC" count={PARTICLE_COUNT} array={posC} itemSize={3} />
        <bufferAttribute attach="attributes-colorIntensity" count={PARTICLE_COUNT} array={colorIntensity} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgressB: { value: 0 },
          uProgressC: { value: 0 }
        }}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
