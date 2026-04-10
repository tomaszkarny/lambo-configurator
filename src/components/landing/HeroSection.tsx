'use client';

import { motion } from 'framer-motion';
import { useScrollStore } from '@/store/useScrollStore';
import { landingContent } from '@/config/landing-content';
import ScrollIndicator from './shared/ScrollIndicator';

export default function HeroSection() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);
  const { title, subtitle, tagline } = landingContent.hero;

  // Fade out as user scrolls: opacity 1 at 0, opacity 0 at 0.08
  const opacity = Math.max(0, 1 - scrollProgress / 0.08);

  return (
    <section
      className="relative w-full h-full pointer-events-none flex items-start justify-center pt-[12vh]"
      style={{ opacity }}
    >
      <div className="text-center">
        {/* Subtitle */}
        <motion.p
          className="text-sm tracking-[0.3em] uppercase text-white/50 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0, 1] }}
        >
          {subtitle}
        </motion.p>

        {/* Main title */}
        <motion.h1
          className="font-extralight uppercase tracking-[0.12em] text-white"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', lineHeight: 0.95 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.4, 0, 1] }}
        >
          {title}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-sm tracking-[0.25em] text-white/55 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          {tagline}
        </motion.p>
      </div>

      <ScrollIndicator />
    </section>
  );
}
