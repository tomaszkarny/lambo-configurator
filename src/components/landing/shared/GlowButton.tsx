'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'outline';
  href?: string;
}

export default function GlowButton({
  children,
  onClick,
  className,
  variant = 'primary',
  href,
}: GlowButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest rounded-sm transition-all duration-300 cursor-pointer';

  const variantStyles =
    variant === 'primary'
      ? 'bg-[#ff6600] text-black shadow-[0_0_30px_rgba(255,102,0,0.4)] hover:shadow-[0_0_40px_rgba(255,102,0,0.6)]'
      : 'border border-[#ff6600]/30 text-[#ff6600] hover:bg-[#ff6600]/10';

  const combinedClassName = `${baseStyles} ${variantStyles} ${className ?? ''}`;

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    className: combinedClassName,
  } as const;

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
