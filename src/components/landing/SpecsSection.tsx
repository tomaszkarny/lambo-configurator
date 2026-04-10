'use client';

import RevealText from './shared/RevealText';
import SectionHeading from './shared/SectionHeading';
import { landingContent } from '@/config/landing-content';

export default function SpecsSection() {
  const { specs } = landingContent;

  return (
    <section className="relative w-full h-full pointer-events-none flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-6 w-full">
        {/* Title */}
        <SectionHeading
          title="SPECIFICATIONS"
          subtitle="Performance Data"
          align="center"
          className="mb-16"
        />

        {/* Specs grid */}
        <RevealText
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          stagger
          staggerDelay={0.08}
          delay={0.2}
        >
          {specs.map((spec) => (
            <div key={spec.label} className="text-center md:text-left">
              <p className="text-[11px] tracking-[0.3em] uppercase text-white/55 mb-2">
                {spec.label}
              </p>
              <p className="text-3xl md:text-4xl font-light text-white tracking-tight">
                {spec.value}
              </p>
              {spec.unit && (
                <p className="mt-1 text-xs tracking-widest uppercase text-white/50">
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
