"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the 3D scene to keep it out of the initial bundle
const LandingScene = dynamic(() => import("./LandingScene"), { ssr: false });

export function LandingClient({ initialSkip }: { initialSkip: boolean }) {
  const router = useRouter();
  const [shouldSkip, setShouldSkip] = useState(initialSkip);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Check reduced motion and screen width
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches || window.innerWidth < 700) {
      setShouldSkip(true);
    }
  }, []);

  const handleComplete = () => {
    // Set a cookie so we don't show this again for the session
    document.cookie = "has_seen_intro=true; path=/";
    // Navigate to dashboard (middleware will redirect to login if not authenticated)
    router.push("/dashboard");
  };

  if (!isMounted) return null;

  if (shouldSkip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          Take Control of Your <span className="text-indigo-600">Finances</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          A personal finance tracker built to demonstrate real end-to-end engineering. Track accounts, categorize spending, and visualize your financial health in one place.
        </p>
        <button
          onClick={handleComplete}
          className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-safe:transition-colors"
        >
          Enter Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#0f172a] overflow-hidden">
      <div className="absolute top-16 w-full text-center z-10 pointer-events-none flex flex-col items-center px-4">
        <div className="inline-flex items-center rounded-full px-3 py-1 mb-6 text-sm font-medium text-indigo-300 ring-1 ring-inset ring-indigo-400/20 bg-indigo-400/10 backdrop-blur-md">
          Finance v2.0
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm">
          Welcome to Finance
        </h1>
        <p className="text-slate-300 mt-4 text-lg font-light tracking-wide max-w-xl">
          An interactive dashboard to track accounts, categorize spending, and visualize your financial health. Click any panel to enter.
        </p>
      </div>
      
      <LandingScene onComplete={handleComplete} />

      <button 
        onClick={handleComplete}
        className="absolute top-8 right-8 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full text-white/70 hover:text-white text-sm transition-colors z-50 backdrop-blur-sm border border-white/10"
      >
        Skip Intro
      </button>
    </div>
  );
}
