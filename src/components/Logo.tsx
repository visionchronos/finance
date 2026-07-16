import React from 'react';

export function Logo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <img 
      src="/lion-logo.jpg" 
      alt="Lion Logo" 
      className={`mix-blend-screen object-contain ${className}`} 
    />
  );
}
