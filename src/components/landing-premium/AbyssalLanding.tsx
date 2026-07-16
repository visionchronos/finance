"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import { ChromaVideo } from "./ChromaVideo";

// Dynamically import the 3D scene so it only renders on client
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#05050A]" />
});

// Staggered text animation variants
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const lineVariants: Variants = {
  hidden: { y: 50, opacity: 0, rotateX: 20 },
  visible: { 
    y: 0, 
    opacity: 1, 
    rotateX: 0,
    transition: { duration: 0.12, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] }
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
      <section className="relative h-screen w-full overflow-hidden flex items-center bg-[#05050A]">
        
        {/* Ambient Video Background */}
        <ChromaVideo />

        {/* Background 3D Scene */}
        <div className="absolute inset-0 z-0 pointer-events-none">
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
                transition={{ duration: 0.12, delay: 0.05 }}
                className="h-[1px] bg-[#00FFA3]" 
              />
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.12, delay: 0.1 }}
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
              transition={{ duration: 0.12, delay: 0.15 }}
              className="mt-12 text-lg md:text-xl text-[#A1A1AA] font-mono leading-relaxed max-w-md pointer-events-auto"
            >
              Master your financial universe with unparalleled precision and real-time insights.
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
      
      {/* Features Section */}
      <section id="features" className="relative py-32 bg-[#05050A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-6">
              Precision Instruments for<br />
              <span className="text-[#00FFA3] italic">Financial Mastery</span>
            </h2>
            <p className="text-[#A1A1AA] font-mono text-sm tracking-wide max-w-xl">
              We provide the tools necessary to analyze, understand, and control every aspect of your wealth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                title: "Comprehensive Account Tracking",
                desc: "Aggregate all your accounts in one unified dashboard. From checking to investments, visualize your total net worth seamlessly.",
                delay: 0.1
              },
              {
                title: "Advanced Cash Flow Visualization",
                desc: "Understand exactly where your money goes with our interactive Sankey diagrams and deep-dive analytics.",
                delay: 0.2
              },
              {
                title: "Intelligent Budgeting",
                desc: "Set, monitor, and achieve your financial goals with proactive budget tracking and real-time progress indicators.",
                delay: 0.3
              },
              {
                title: "Frictionless Data Import",
                desc: "Bring your historical data with ease using our robust CSV import tool, designed for seamless integration and categorization.",
                delay: 0.4
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.2, delay: feature.delay }}
                className="group relative p-8 rounded-3xl border border-white/[0.08] bg-[#0F1016] hover:bg-[#13141C] transition-colors"
              >
                <div className="absolute top-0 left-8 w-12 h-[1px] bg-[#00FFA3] group-hover:w-24 transition-all duration-500" />
                <h3 className="text-xl font-medium text-white mb-4 mt-2">{feature.title}</h3>
                <p className="text-[#A1A1AA] leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 border-t border-white/[0.08] bg-[#05050A] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00FFA3] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-8">
            Ready to take <span className="italic text-[#C4B5FD]">control</span>?
          </h2>
          <p className="text-[#A1A1AA] font-mono mb-12 max-w-xl mx-auto">
            Join the platform built for those who demand absolute clarity and uncompromising precision in their financial life.
          </p>
          <Link 
            href={isSignedIn ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium uppercase tracking-wider text-[#05050A] bg-white hover:bg-[#00FFA3] rounded-full transition-all duration-300 hover:scale-105"
          >
            {isSignedIn ? "Enter Dashboard" : "Get Started Now"}
          </Link>
        </div>
      </section>

    </div>
  );
}
