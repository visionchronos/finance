"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function ChromaVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 899px)");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // If not mounted or we should not render, don't run the loop
    if (!isMounted || isReducedMotion || isMobile) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let isPlaying = false;

    const startProcessing = () => {
      width = video.videoWidth;
      height = video.videoHeight;
      
      // Don't start if dimensions aren't loaded yet
      if (width === 0 || height === 0) return;
      
      canvas.width = width;
      canvas.height = height;
      video.playbackRate = 0.5;
      
      video.play().catch(e => console.error("Video autoplay blocked:", e));
      
      if (!isPlaying) {
        isPlaying = true;
        loop();
      }
    };

    const loop = () => {
      if (!video || !canvas) return;
      
      // If paused, keep checking but don't draw
      if (video.paused || video.ended) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);
      
      const frame = ctx.getImageData(0, 0, width, height);
      const data = frame.data;
      const l = data.length;

      // Chroma key processing
      for (let i = 0; i < l; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (g > 80 && g > r * 1.3 && g > b * 1.3) {
          data[i + 3] = 0; 
        }
      }

      ctx.putImageData(frame, 0, 0);
      requestRef.current = requestAnimationFrame(loop);
    };

    // Attach multiple events to ensure it catches the right moment across browsers
    video.addEventListener("loadedmetadata", startProcessing);
    video.addEventListener("canplay", startProcessing);
    video.addEventListener("playing", startProcessing);

    // Enforce looping manually just in case the HTML attribute fails
    const onEnded = () => {
      video.currentTime = 0;
      video.play().catch(e => console.error("Replay blocked:", e));
    };
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 1) { // HAVE_METADATA or more
      startProcessing();
    }

    return () => {
      video.removeEventListener("loadedmetadata", startProcessing);
      video.removeEventListener("canplay", startProcessing);
      video.removeEventListener("playing", startProcessing);
      video.removeEventListener("ended", onEnded);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isMounted, isReducedMotion, isMobile]);

  // Don't render anything if we haven't mounted or if we meet the exclusion criteria
  if (!isMounted || isReducedMotion || isMobile) {
    return null;
  }

  return (
    <>
      <video
        ref={videoRef}
        src="/money-rain-optimized.mp4"
        crossOrigin="anonymous"
        autoPlay
        muted
        loop
        playsInline
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        style={{
          opacity: 0.35,
          filter: "saturate(0.8) blur(0.5px)",
        }}
      />
    </>
  );
}
