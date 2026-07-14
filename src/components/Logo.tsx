import React from 'react';

export function Logo({ className = "h-8 w-auto text-[#1b5e3a]" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 300 160" 
      className={className} 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 150 20 L 210 80 L 210 110 L 150 50 L 90 110 L 90 80 Z" />
      <text 
        x="150" 
        y="150" 
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        fontSize="42" 
        fontWeight="900" 
        letterSpacing="0.05em" 
        textAnchor="middle" 
      >
        MANAGEMENT
      </text>
    </svg>
  );
}
