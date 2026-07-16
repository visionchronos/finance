"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import dynamic from "next/dynamic";
import Lenis from "lenis";

// Dynamically import the 3D scene so it only renders on client
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#05050A]" />
});

// Staggered text animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const lineVariants = {
  hidden: { y: 50, opacity: 0, rotateX: 20 },
  visible: { 
    y: 0, 
    opacity: 1, 
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

interface AbyssalLandingProps {
  isSignedIn: boolean;
}

export function AbyssalLanding({ isSignedIn }: AbyssalLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Lenis smooth scroll wired to requestAnimationFrame
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative w-full bg-[#05050A] text-[#FAFAFA] font-sans selection:bg-[#00FFA3]/30 min-h-[200vh]" ref={containerRef}>
      
      {/* 1. Sticky Nav */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full border border-white/[0.08] bg-[#0F1016]/80 backdrop-blur-md px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.5)]" />
            <span className="font-sans font-medium tracking-tight text-sm">Abyssal Finance</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-[0.2em] text-[#A1A1AA]">
            <Link href="#manifesto" className="hover:text-white transition-colors">MANIFESTO</Link>
            <Link href="#features" className="hover:text-white transition-colors">FEATURES</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">PRICING</Link>
          </div>
          
          <Link 
            href={isSignedIn ? "/dashboard" : "/login"}
            className="text-xs font-medium uppercase tracking-wider text-[#05050A] bg-white hover:bg-[#00FFA3] px-5 py-2 rounded-full transition-colors duration-300"
          >
            {isSignedIn ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </div>

      {/* 2. Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center">
        
        {/* Background 3D Scene */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>
        
        {/* Vignette + Dot Grid Overlay */}
        <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#05050A_100%)] opacity-80" />
        <div className="absolute inset-0 z-1 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Content */}
        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center h-full pointer-events-none"
          style={{ y: y1, opacity }}
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                whileInView={{ width: 24 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#00FFA3]" 
              />
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[10px] uppercase tracking-[0.3em] text-[#A1A1AA] font-mono"
              >
                — Your money, mapped —
              </motion.span>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-5xl md:text-7xl lg:text-[7.6vw] leading-[0.92] font-sans font-light tracking-tighter relative"
            >
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-[#00FFA3] opacity-[0.08] blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
              <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[300px] h-[300px] bg-[#C4B5FD] opacity-[0.08] blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

              <div className="overflow-hidden pb-2 relative z-10">
                <motion.div variants={lineVariants}>
                  Wealth reduced
                </motion.div>
              </div>
              <div className="overflow-hidden pb-2 relative z-10">
                <motion.div variants={lineVariants}>
                  to a single <span className="italic font-thin text-[#C4B5FD] drop-shadow-[0_0_15px_rgba(196,181,253,0.4)]">continuous</span>
                </motion.div>
              </div>
              <div className="overflow-hidden pb-2 relative z-10">
                <motion.div variants={lineVariants}>
                  line<span className="text-[#00FFA3] drop-shadow-[0_0_15px_rgba(0,255,163,0.6)]">.</span>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 text-lg md:text-xl text-[#A1A1AA] font-mono leading-relaxed max-w-md pointer-events-auto"
            >
              Our website features and core values
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <section className="py-12 border-y border-white/[0.08] bg-[#0F1016]">
        <Marquee autoFill gradient gradientColor="#05050A" speed={40}>
          {["ABSOLUTE CLARITY", "UNCOMPROMISING PRECISION", "ELEVATED INSIGHTS", "SEAMLESS EXECUTION"].map((text, i) => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-sm font-mono tracking-[0.2em] text-[#52525B]">{text}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]/50 ml-16" />
            </div>
          ))}
        </Marquee>
      </section>
      
      {/* Spacer to show scrolling */}
      <div className="h-screen bg-[#05050A] flex items-center justify-center">
        <p className="text-[#52525B] font-mono text-sm tracking-[0.2em] uppercase">Our website features and core values</p>
      </div>

    </div>
  );
}
