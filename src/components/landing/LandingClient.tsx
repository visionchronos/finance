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
      <div className="absolute top-10 w-full text-center z-10 pointer-events-none">
        <h1 className="text-4xl font-bold text-white/90 drop-shadow-md">Welcome to Finance</h1>
        <p className="text-indigo-200 mt-2">Click any panel to enter</p>
      </div>
      
      <LandingScene onComplete={handleComplete} />

      <button 
        onClick={handleComplete}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/90 text-sm transition-colors z-10"
      >
        Skip Intro
      </button>
    </div>
  );
}
