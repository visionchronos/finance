import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Use false as default to avoid hydration mismatches if possible, 
  // or true if you want to default to avoiding heavy work.
  // Actually, defaulting to false is safer for SSR, but since we are dealing with a canvas,
  // we could do a client-side only check to avoid hydration issues entirely.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(media.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else if (media.addListener) {
      // fallback for older browsers
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else if (media.removeListener) {
        // fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
