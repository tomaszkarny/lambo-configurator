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
        <p
          className="mb-3 uppercase text-white/65"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 'clamp(0.68rem, 0.9vw, 0.75rem)',
            letterSpacing: '0.32em',
          }}
        >
          {subtitle}
        </p>
      )}
      <h2
        className={`font-light tracking-tight ${
          gradient
            ? 'bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent'
            : 'text-white'
        }`}
        style={{
          fontSize: 'clamp(1.85rem, 5.2vw, 4.25rem)',
          lineHeight: 1.05,
        }}
      >
        {title}
      </h2>
    </RevealText>
  );
}
