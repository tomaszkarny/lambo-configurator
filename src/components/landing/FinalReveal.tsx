'use client';

import { motion } from 'framer-motion';
import { useScrollStore } from '@/store/useScrollStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scrollToProgress } from '@/lib/scroll-nav';
import GlowButton from './shared/GlowButton';

/**
 * HTML overlay that fades in during the finale scroll window (0.92-0.985).
 * Fixed-positioned outside #scroll-content so clicks land reliably; the
 * wrapper itself is pointer-events: none so it never blocks the canvas,
 * and only the CTA opts back in.
 */
export default function FinalReveal() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);
  const reduced = useReducedMotion();

  // Fade in: 0 at p=0.92, 1 at p=0.985
  const opacity = reduced
    ? scrollProgress >= 0.95
      ? 1
      : 0
    : Math.max(0, Math.min(1, (scrollProgress - 0.92) / 0.065));

  if (opacity === 0) return null;

  const revealed = opacity > 0.1;

  return (
    <div
      role="region"
      aria-label="Final reveal"
      aria-hidden={opacity < 0.5}
      className="fixed inset-0 z-[45] pointer-events-none flex flex-col items-center justify-end
        pb-[14vh] md:pb-[16vh]"
      style={{ opacity }}
    >
      {/* Cinematic bottom-up darkening gradient — stronger to mask footer wordmark behind */}
      <div
        className="absolute inset-x-0 bottom-0 h-[85vh] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.82) 30%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Headline — light uppercase with wide tracking for finale drama */}
      <motion.h2
        className="relative font-extralight uppercase text-white text-center tracking-[0.18em]"
        style={{
          fontSize: 'clamp(2.5rem, 7vw, 6rem)',
          lineHeight: 0.95,
          textShadow:
            '0 2px 36px rgba(0,0,0,0.85), 0 0 60px rgba(0,232,255,0.1)',
        }}
        initial={reduced ? false : { y: 24 }}
        animate={{ y: revealed ? 0 : 24 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120 }}
      >
        THE FUTURE,
        <br />
        NOW
      </motion.h2>

      {/* Subtitle — cyan mono mark */}
      <motion.p
        className="relative mt-5 uppercase text-cyan-300/75"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)',
          letterSpacing: '0.4em',
          textShadow: '0 0 14px rgba(0,232,255,0.22), 0 1px 10px rgba(0,0,0,0.85)',
        }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        Concept · Lamborghini Terzo Millennio
      </motion.p>

      {/* CTA — only pointer-events-auto child */}
      <motion.div
        className="relative mt-10 pointer-events-auto"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0, 1] }}
      >
        <GlowButton variant="primary" onClick={() => scrollToProgress(0.888)}>
          Configure Your Vision
        </GlowButton>
      </motion.div>
    </div>
  );
}
