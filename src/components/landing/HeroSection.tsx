'use client';

import { useScrollStore } from '@/store/useScrollStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import ScrollIndicator from './shared/ScrollIndicator';

export default function HeroSection() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);
  const reduced = useReducedMotion();

  // Scroll-driven reveal — text hidden at rest (p=0), eases in as user starts scrolling.
  // Ramp 0.005 → 0.03 (fade in), hold until 0.08, fade out to 0.14.
  const revealT = reduced
    ? scrollProgress > 0.005
      ? 1
      : 0
    : Math.min(1, Math.max(0, (scrollProgress - 0.005) / 0.025));

  const holdT =
    scrollProgress < 0.08
      ? 1
      : Math.max(0, 1 - (scrollProgress - 0.08) / 0.06);

  const finalOpacity = revealT * holdT;
  const translateY = reduced ? 0 : (1 - revealT) * 24;

  return (
    <section
      className="sticky top-0 w-full h-screen pointer-events-none flex items-start justify-center pt-[7vh] px-8"
      aria-hidden={finalOpacity === 0}
    >
      <div
        className="relative text-center max-w-[90vw] will-change-[opacity,transform]"
        style={{
          opacity: finalOpacity,
          transform: `translate3d(0, ${translateY}px, 0)`,
          transition: reduced ? 'none' : 'opacity 0.12s linear',
        }}
      >
        {/* Premium backdrop wash — radial + vertical fade ensures text legibility
            over fog from any camera angle. Stronger center, graceful periphery. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[-25%] inset-y-[-40%] -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.2) 72%, rgba(0,0,0,0) 92%)',
          }}
        />
        {/* Top viewport linear mask — pulls down dark toward hero text block */}
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 h-[32vh] -z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,10,18,0.7) 0%, rgba(5,10,18,0.35) 55%, rgba(5,10,18,0) 100%)',
          }}
        />

        {/* Metadata eyebrow — technical, monospaced, brighter cyan with glow */}
        <div
          className="text-[12px] tracking-[0.45em] uppercase text-cyan-200 mb-10 flex items-center justify-center gap-3"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            textShadow:
              '0 0 18px rgba(0,232,255,0.35), 0 1px 12px rgba(0,0,0,0.85)',
          }}
        >
          <span
            className="h-px w-12 bg-cyan-300/90"
            style={{ boxShadow: '0 0 8px rgba(0,232,255,0.55)' }}
          />
          <span>2017 · Concept · Lamborghini</span>
          <span
            className="h-px w-12 bg-cyan-300/90"
            style={{ boxShadow: '0 0 8px rgba(0,232,255,0.55)' }}
          />
        </div>

        {/* Main title — editorial serif, weight mix, layered shadow for legibility */}
        <h1
          className="text-white whitespace-nowrap"
          style={{
            fontFamily:
              'var(--font-instrument-serif), "Instrument Serif", serif',
            fontSize: 'clamp(3.5rem, 11vw, 10rem)',
            lineHeight: 0.92,
            fontWeight: 400,
            letterSpacing: '-0.04em',
            textShadow:
              '0 2px 28px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5)',
          }}
        >
          <span>Terzo</span>
          <span
            className="italic font-light ml-[0.12em]"
            style={{ opacity: 0.92 }}
          >
            Millennio
          </span>
        </h1>

        {/* Tagline — brighter, with subtle glow for legibility on dark fog */}
        <p
          className="text-[12px] tracking-[0.5em] uppercase text-white/85 mt-10"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            textShadow: '0 1px 14px rgba(0,0,0,0.85), 0 0 24px rgba(0,232,255,0.18)',
          }}
        >
          The Future, Electrified
        </p>
      </div>

      <ScrollIndicator />
    </section>
  );
}
