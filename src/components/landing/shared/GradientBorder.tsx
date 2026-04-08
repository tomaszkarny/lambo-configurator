'use client';

import { type ReactNode } from 'react';

interface GradientBorderProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function GradientBorder({
  children,
  className,
  animate = true,
}: GradientBorderProps) {
  return (
    <div
      className={`
        relative rounded-lg border border-white/10
        bg-[#0a0a0a]/80 backdrop-blur-sm
        transition-all duration-300
        ${animate ? 'hover:border-[#ff6600]/30 hover:shadow-[0_0_20px_rgba(255,102,0,0.1)]' : ''}
        ${className ?? ''}
      `}
    >
      {children}
    </div>
  );
}
