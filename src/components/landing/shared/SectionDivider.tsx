'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <div ref={ref} className={`my-8 ${className ?? ''}`}>
      <motion.div
        className="mx-auto h-px w-full max-w-2xl"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,102,0,0.3), transparent)',
        }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.75, ease: [0.25, 0.4, 0, 1] }}
      />
    </div>
  );
}
