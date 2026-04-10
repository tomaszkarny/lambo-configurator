'use client';

import RevealText from './RevealText';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  gradient?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  align = 'left',
  gradient = false,
  className,
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center' : 'text-left';

  return (
    <RevealText className={`${alignment} ${className ?? ''}`}>
      {subtitle && (
        <p className="mb-3 text-[11px] tracking-[0.3em] uppercase text-white/55">
          {subtitle}
        </p>
      )}
      <h2
        className={`text-3xl md:text-5xl font-light tracking-tight ${
          gradient
            ? 'bg-gradient-to-r from-white to-[#ff6600] bg-clip-text text-transparent'
            : 'text-white'
        }`}
      >
        {title}
      </h2>
    </RevealText>
  );
}
