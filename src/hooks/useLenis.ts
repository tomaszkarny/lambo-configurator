'use client';

import { useEffect, useState } from 'react';
import type Lenis from 'lenis';
import { getLenis } from '@/lib/lenis-instance';

/**
 * Returns the shared Lenis instance created by useSmoothScroll. Polls on mount
 * because useSmoothScroll runs in a separate useEffect that may not have
 * initialized by the time consumers mount (React StrictMode double-mount too).
 */
export function useLenis(): Lenis | null {
  const [lenis, setLenisState] = useState<Lenis | null>(() => getLenis());

  useEffect(() => {
    if (lenis) return;
    const id = setInterval(() => {
      const current = getLenis();
      if (current) {
        setLenisState(current);
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, [lenis]);

  return lenis;
}
