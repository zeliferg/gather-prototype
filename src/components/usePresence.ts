import { useEffect, useState } from 'react';

const EXIT_MS = 520; // covers --dur-sheet (480ms) + a frame; keep in step with tokens.css

export function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: the first lets the browser paint the element in its off-screen
      // starting position, the second adds the class so the transition actually runs.
      // With a single frame the start state is never painted and sheets just appear.
      let inner = 0;
      const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setVisible(true)); });
      return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);
  return { mounted, visible };
}
