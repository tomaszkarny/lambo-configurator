'use client';

import { motion } from 'framer-motion';
import SectionDivider from './shared/SectionDivider';
import RevealText from './shared/RevealText';
import { landingContent } from '@/config/landing-content';
import { scrollToProgress } from '@/lib/scroll-nav';
import { useScrollStore } from '@/store/useScrollStore';

export default function FooterSection() {
  const { cta, credits } = landingContent.footer;
  const scrollProgress = useScrollStore((s) => s.scrollProgress);

  // Fade out between 0.88-0.92 so FooterSection is gone before FinalReveal fades in (0.92-0.985).
  // Without this the wordmark + footer CTA overlap the finale headline + primary CTA.
  const opacity = Math.max(0, Math.min(1, (0.92 - scrollProgress) / 0.04));
  const hidden = opacity < 0.05;

  const handleConfigureClick = () => scrollToProgress(0.888);

  return (
    <motion.footer
      className="relative w-full h-full flex flex-col items-center justify-center px-6"
      style={{ opacity, pointerEvents: hidden ? 'none' : 'auto' }}
      aria-hidden={hidden}
    >
      <SectionDivider className="w-full max-w-2xl" />

      {/* Wordmark — editorial serif to mirror hero */}
      <RevealText className="text-center mt-8">
        <p
          className="uppercase text-white/65"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 'clamp(0.7rem, 0.9vw, 0.8rem)',
            letterSpacing: '0.38em',
          }}
        >
          Lamborghini
        </p>
        <p
          className="mt-3 text-white/90"
          style={{
            fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
            fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Terzo <span className="italic font-light opacity-85">Millennio</span>
        </p>
      </RevealText>

      {/* CTA Button — cyan palette matches hero direction */}
      <RevealText delay={0.3} className="mt-12">
        <motion.button
          onClick={handleConfigureClick}
          aria-label="Jump to configurator section"
          className="group relative px-12 py-4 border border-cyan-400/55 uppercase text-white cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 'clamp(0.72rem, 0.9vw, 0.82rem)',
            letterSpacing: '0.22em',
            boxShadow: '0 0 20px rgba(0,232,255,0.14)',
          }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(0,232,255,0.28)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className="absolute inset-0 bg-cyan-400/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true" />
          <span className="relative">{cta}</span>
        </motion.button>
      </RevealText>

      {/* Credits */}
      <RevealText delay={0.5} className="mt-12">
        <p
          className="text-center uppercase text-white/60"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 'clamp(0.58rem, 0.7vw, 0.65rem)',
            letterSpacing: '0.24em',
          }}
        >
          {credits}
        </p>
      </RevealText>
    </motion.footer>
  );
}
