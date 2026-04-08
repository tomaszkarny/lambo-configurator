'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfigStore } from '@/store/useConfigStore';
import { useScrollStore } from '@/store/useScrollStore';
import { bodyColors } from '@/config/colors';

const CYCLE_INTERVAL = 2500;

export default function ColorShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSection = useScrollStore((s) => s.activeSection);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // The color-showcase section is index 3 (hero=0, intro=1, design=2, color-showcase=3)
  const isSectionActive = activeSection === 3;

  const cycleColor = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % bodyColors.length);
  }, []);

  // Auto-cycle through colors
  useEffect(() => {
    if (!isSectionActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(cycleColor, CYCLE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSectionActive, cycleColor]);

  // Apply color to 3D car
  useEffect(() => {
    if (isSectionActive) {
      useConfigStore.getState().setBodyColor(bodyColors[activeIndex].hex);
    }
  }, [activeIndex, isSectionActive]);

  const activeColor = bodyColors[activeIndex];

  return (
    <section className="relative w-full h-full pointer-events-none flex items-end justify-end">
      <div className="pb-20 pr-6 md:pb-20 md:pr-20">
        {/* Color name with crossfade */}
        <div className="relative h-16 md:h-20 flex items-end mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeColor.name}
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0, 1] }}
            >
              {/* Color swatch */}
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-black"
                  style={{ backgroundColor: activeColor.hex }}
                />
              </div>

              {/* Color name */}
              <h3 className="text-3xl md:text-5xl font-light text-white tracking-tight">
                {activeColor.name}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Color dots row */}
        <div className="flex gap-2 items-center">
          {bodyColors.map((color, i) => (
            <div
              key={color.name}
              className="relative flex items-center justify-center"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'scale-150 ring-1 ring-white/50 ring-offset-1 ring-offset-black'
                    : 'opacity-40'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            </div>
          ))}
        </div>

        {/* Section label */}
        <p className="mt-6 text-[10px] tracking-[0.3em] uppercase text-white/20">
          Available Colors
        </p>
      </div>
    </section>
  );
}
