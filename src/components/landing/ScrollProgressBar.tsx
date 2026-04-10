'use client';

import { motion } from 'framer-motion';
import { useScrollStore } from '@/store/useScrollStore';

/**
 * Section start offsets as fractions of total scroll (see landing-content.ts):
 *   hero 0, intro 0.222, design 0.333, color 0.667, configurator 0.833,
 *   specs 0.944, footer ~0.99. Drawn as subtle tick marks.
 */
const SECTION_TICKS = [0.222, 0.333, 0.667, 0.833, 0.944, 0.99];

export default function ScrollProgressBar() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[50] h-[3px] bg-white/5"
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      {/* Active fill */}
      <motion.div
        className="h-full w-full origin-left"
        style={{
          background:
            'linear-gradient(to right, #ff6600, rgba(255,102,0,0.7))',
          scaleX: scrollProgress,
        }}
        animate={{ opacity: scrollProgress > 0 ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      />

      {/* Section tick marks */}
      {SECTION_TICKS.map((t) => (
        <span
          key={t}
          aria-hidden="true"
          className="absolute top-0 h-full w-px bg-white/25 pointer-events-none"
          style={{ left: `${t * 100}%` }}
        />
      ))}
    </div>
  );
}
