'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfigPanel from '@/components/ui/ConfigPanel';
import Header from '@/components/ui/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { useScrollStore } from '@/store/useScrollStore';

export default function ConfiguratorSection() {
  const { isMobile } = useResponsive();
  const isConfigurator = useScrollStore((s) => s.isConfigurator);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleContinue = () => {
    // Scroll to next section (specs)
    const specsSection = document.getElementById('specs');
    if (specsSection) {
      specsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative w-full min-h-screen pointer-events-auto"
      onPointerDown={handleInteraction}
    >
      {/* Visual distinction overlay - subtle border/glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6600]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff6600]/20 to-transparent" />
      </div>

      {/* Title overlay - fades when user interacts */}
      <AnimatePresence>
        {isConfigurator && !hasInteracted && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <h2
                className="font-extralight uppercase tracking-[0.2em] text-white/20"
                style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
              >
                CONFIGURE
              </h2>
              <p className="mt-4 text-xs tracking-[0.3em] uppercase text-white/20">
                Tap to begin customizing
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header + ConfigPanel (only show when section is active) */}
      {isConfigurator && (
        <>
          <Header />
          <ConfigPanel isMobile={isMobile} />
        </>
      )}

      {/* Continue scrolling button */}
      {isConfigurator && hasInteracted && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <button
            onClick={handleContinue}
            className="group flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase">
              Continue Scrolling
            </span>
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-current"
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </button>
        </motion.div>
      )}
    </section>
  );
}
