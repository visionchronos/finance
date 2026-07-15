"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export function ScrambleText({ text, className = "" }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let frame = 0;
    const maxFrames = 15; // Number of frames before settling
    
    // We want a slight stagger. Each letter has a different frame it settles at.
    const settleFrames = Array.from({ length: text.length }).map((_, i) => maxFrames + i * 2);
    const finalFrame = Math.max(...settleFrames, maxFrames);
    
    let interval: NodeJS.Timeout;
    
    const animate = () => {
      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          result += " ";
          continue;
        }
        if (frame >= settleFrames[i]) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(result);
      frame++;
      
      if (frame > finalFrame) {
        clearInterval(interval);
      }
    };

    // Delay start slightly
    setTimeout(() => {
      interval = setInterval(animate, 40);
    }, 200);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return <span className={className}>{displayText}</span>;
}
