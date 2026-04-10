'use client';

import RevealText from './shared/RevealText';
import StatCounter from './shared/StatCounter';
import SectionHeading from './shared/SectionHeading';
import { landingContent } from '@/config/landing-content';

export default function IntroSection() {
  const { title, description, stats } = landingContent.intro;

  return (
    <section className="relative w-full h-full pointer-events-none flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Title */}
        <SectionHeading title={title} align="center" gradient />

        {/* Description */}
        <RevealText delay={0.2}>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/70 font-light leading-relaxed">
            {description}
          </p>
        </RevealText>

        {/* Stats */}
        <RevealText className="mt-16 grid grid-cols-3 gap-8" stagger staggerDelay={0.15} delay={0.4}>
          {stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={0.5}
            />
          ))}
        </RevealText>
      </div>
    </section>
  );
}
