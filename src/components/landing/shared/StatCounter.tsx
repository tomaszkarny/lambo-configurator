'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useInView,
  useMotionValue,
  animate,
} from 'framer-motion';

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  className?: string;
  delay?: number;
  duration?: number;
}

function formatValue(raw: number, isDecimal: boolean): string {
  if (isDecimal) {
    return raw.toFixed(1);
  }

  const rounded = Math.round(raw);
  if (rounded >= 1000) {
    return new Intl.NumberFormat().format(rounded);
  }
  return String(rounded);
}

export default function StatCounter({
  value,
  suffix,
  label,
  className,
  delay = 0,
  duration = 2,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });
  const motionVal = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState('0');
  const hasAnimated = useRef(false);

  const isDecimal = value % 1 !== 0;

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const controls = animate(motionVal, value, {
      duration,
      ease: 'easeOut',
      delay,
    });

    const unsubscribe = motionVal.on('change', (latest) => {
      setDisplayValue(formatValue(latest, isDecimal));
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, motionVal, value, duration, delay, isDecimal]);

  return (
    <div ref={ref} className={className}>
      <p className="text-5xl md:text-6xl font-light tracking-tight text-white">
        {displayValue}
        {suffix && (
          <span className="text-white/60">{suffix}</span>
        )}
      </p>
      <p className="mt-2 text-xs tracking-widest uppercase text-white/55">
        {label}
      </p>
    </div>
  );
}
