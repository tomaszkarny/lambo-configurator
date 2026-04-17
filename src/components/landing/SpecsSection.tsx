'use client';

import RevealText from './shared/RevealText';
import SectionHeading from './shared/SectionHeading';
import { landingContent } from '@/config/landing-content';
import { useScrollStore } from '@/store/useScrollStore';

export default function SpecsSection() {
  const { specs } = landingContent;
  const scrollProgress = useScrollStore((s) => s.scrollProgress);

  // FinalReveal starts fading in at 0.92, full at 0.985. Specs overlap the
  // finale headline at the top of the viewport when both are on screen.
  // Fade specs out across 0.92-0.97 so the finale cinematic shot is clean.
  const opacity = Math.max(0, Math.min(1, (0.97 - scrollProgress) / 0.05));

  return (
    <section
      className="relative w-full h-full pointer-events-none flex items-center justify-center"
      style={{ opacity }}
      aria-hidden={opacity < 0.05}
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        {/* Title */}
        <SectionHeading
          title="SPECIFICATIONS"
          subtitle="Performance Data"
          align="center"
          className="mb-16"
        />

        {/* Specs grid — wider container + tighter max font so long values stay on one line */}
        <RevealText
          className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-12 md:gap-x-12 md:gap-y-14"
          stagger
          staggerDelay={0.08}
          delay={0.2}
        >
          {specs.map((spec) => (
            <div key={spec.label} className="text-center md:text-left min-w-0">
              <p
                className="uppercase text-white/65 mb-2 whitespace-nowrap"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: 'clamp(0.62rem, 0.76vw, 0.7rem)',
                  letterSpacing: '0.26em',
                }}
              >
                {spec.label}
              </p>
              <p
                className="font-light text-white tracking-tight whitespace-nowrap leading-none"
                style={{
                  fontSize: 'clamp(1.25rem, 2.3vw, 1.85rem)',
                }}
              >
                {spec.value}
              </p>
              {spec.unit && (
                <p
                  className="mt-2 uppercase text-white/60 whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: 'clamp(0.58rem, 0.7vw, 0.66rem)',
                    letterSpacing: '0.24em',
                  }}
                >
                  {spec.unit}
                </p>
              )}
            </div>
          ))}
        </RevealText>
      </div>
    </section>
  );
}
