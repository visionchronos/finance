"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ParticleScene, ProgressState } from "./ParticleScene";
import { ScrambleText } from "./ScrambleText";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export function PremiumLandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<ProgressState>({ b: 0, c: 0, transition: 0 });
  const [activeSection, setActiveSection] = useState("01 — OVERVIEW");
  const [isFallback, setIsFallback] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check fallback
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEnd = navigator.hardwareConcurrency < 4;
    
    if (reducedMotion || lowEnd) {
      setIsFallback(true);
      return;
    }

    // Initialize Lenis for smooth scroll
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Setup ScrollTriggers for sections
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrub
      }
    });

    // We have 3 sections, so scroll is split into 2 main transitions
    // Transition A -> B
    tl.to(progressRef.current, {
      b: 1,
      ease: "power2.inOut",
      duration: 1,
      onUpdate: function() {
        // Create a transition spike
        const p = this.progress();
        progressRef.current.transition = Math.sin(p * Math.PI);
        
        if (p < 0.5) setActiveSection("01 — OVERVIEW");
        else setActiveSection("02 — ANALYSIS");
      }
    });

    // Transition B -> C
    tl.to(progressRef.current, {
      c: 1,
      ease: "power2.inOut",
      duration: 1,
      onUpdate: function() {
        const p = this.progress();
        progressRef.current.transition = Math.sin(p * Math.PI);
        
        if (p < 0.5) setActiveSection("02 — ANALYSIS");
        else setActiveSection("03 — GET STARTED");
      }
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  if (!isMounted) return null;

  if (isFallback) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#02040a] to-[#0c162d] text-center px-4 text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <ScrambleText text="WELCOME TO FINANCE" />
        </h1>
        <p className="text-lg text-blue-200/60 mb-10 max-w-2xl font-light">
          Track accounts, categorize spending, and visualize your financial health in one place.
        </p>
        <Link
          href="/dashboard"
          className="rounded-full bg-white/10 border border-white/20 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-colors"
        >
          Enter Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#02040a] text-white selection:bg-blue-500/30" ref={containerRef}>
      
      {/* Fixed Canvas Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleScene progressRef={progressRef} />
      </div>

      {/* Fixed Overlay UI Chrome */}
      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        {/* Header */}
        <div className="flex justify-between items-start w-full pointer-events-auto">
          <div className="text-xs tracking-[0.2em] font-bold opacity-80 mix-blend-difference">
            FINANCE V2.0
          </div>
          {/* Sound/Theme Toggle Placeholder */}
          <button className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mix-blend-difference">
            SOUND OFF
          </button>
        </div>

        {/* Footer/Section Index */}
        <div className="flex justify-between items-end w-full">
          <div className="text-xs tracking-[0.2em] opacity-60 font-mono">
            <ScrambleText text={activeSection} />
          </div>
          <div className="text-xs opacity-40">
            SCROLL TO EXPLORE ↓
          </div>
        </div>
      </div>

      {/* Scrollable Content Sections */}
      <div className="relative z-20 w-full">
        {/* Section 1: Hero */}
        <section className="h-screen w-full flex flex-col justify-center items-center text-center px-4 pointer-events-none">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mix-blend-difference">
            <ScrambleText text="RAW DATA." />
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/50 font-light tracking-wide max-w-2xl mix-blend-difference">
            Fractured across accounts, hidden in silos.
          </p>
        </section>

        {/* Section 2: Analysis */}
        <section className="h-screen w-full flex flex-col justify-center items-center text-center px-4 pointer-events-none">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mix-blend-difference">
            <ScrambleText text="REFINED INTELLIGENCE." />
          </h2>
          <p className="mt-6 text-xl md:text-2xl text-white/50 font-light tracking-wide max-w-2xl mix-blend-difference">
            Structured for perfect clarity.
          </p>
        </section>

        {/* Section 3: Final Call to Action */}
        <section className="h-screen w-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mix-blend-difference mb-12">
            <ScrambleText text="YOUR FINANCIAL CORE." />
          </h2>
          
          <Link
            href="/dashboard"
            className="relative group pointer-events-auto"
          >
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all duration-500"></div>
            <div className="relative rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-10 py-4 text-sm uppercase tracking-widest font-semibold text-white shadow-2xl hover:border-white/50 hover:bg-black/80 transition-all duration-300">
              Enter Platform
            </div>
          </Link>
        </section>
      </div>

    </div>
  );
}
