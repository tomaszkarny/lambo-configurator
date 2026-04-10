'use client';

import RevealText from './shared/RevealText';
import SectionHeading from './shared/SectionHeading';
import { landingContent } from '@/config/landing-content';

export default function DesignSection() {
  const { features } = landingContent;

  return (
    <section className="relative w-full pointer-events-none">
      {features.map((feature, index) => (
        <div
          key={feature.title}
          className="min-h-screen flex items-center"
        >
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="relative max-w-md">
              {/* Background index number */}
              <span className="absolute -left-4 md:-left-10 -top-16 text-8xl font-extralight text-white/[0.08] select-none">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content with accent border */}
              <div className="border-l-2 border-[#ff6600]/50 pl-6">
                <SectionHeading
                  title={feature.title}
                  subtitle={`Feature ${String(index + 1).padStart(2, '0')}`}
                />
                <RevealText delay={0.2}>
                  <p className="mt-4 text-base text-white/60 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </RevealText>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
