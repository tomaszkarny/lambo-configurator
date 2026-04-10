'use client';

import { motion } from 'framer-motion';
import SectionDivider from './shared/SectionDivider';
import RevealText from './shared/RevealText';
import { landingContent } from '@/config/landing-content';
import { scrollToProgress } from '@/lib/scroll-nav';

export default function FooterSection() {
  const { cta, credits } = landingContent.footer;

  // Target 0.888 = middle of the configurator zone (0.833-0.944).
  // Using scrollIntoView lands exactly at the zone boundary, which triggers
  // the colors-overwrite bug because the specs zone reacts to ~0.944.
  const handleConfigureClick = () => scrollToProgress(0.888);

  return (
    <footer className="relative w-full h-full pointer-events-auto flex flex-col items-center justify-center px-6">
      <SectionDivider className="w-full max-w-2xl" />

      {/* Wordmark */}
      <RevealText className="text-center mt-8">
        <p className="text-sm tracking-[0.3em] uppercase text-white/55">
          Lamborghini
        </p>
        <p className="text-2xl md:text-3xl font-extralight tracking-[0.15em] uppercase text-white/80 mt-2">
          Terzo Millennio
        </p>
      </RevealText>

      {/* CTA Button */}
      <RevealText delay={0.3} className="mt-12">
        <motion.button
          onClick={handleConfigureClick}
          className="group relative px-12 py-4 border border-[#ff6600]/60 text-sm tracking-[0.2em] uppercase text-white hover:text-white transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(255,102,0,0.15)]"
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255,102,0,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Hover fill */}
          <span className="absolute inset-0 bg-[#ff6600]/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative">{cta}</span>
        </motion.button>
      </RevealText>

      {/* Credits */}
      <RevealText delay={0.5} className="mt-12">
        <p className="text-[10px] tracking-[0.2em] text-white/50 text-center">
          {credits}
        </p>
      </RevealText>
    </footer>
  );
}
