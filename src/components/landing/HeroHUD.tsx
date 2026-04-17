'use client';

import { motion } from 'framer-motion';
import { useScrollStore } from '@/store/useScrollStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function HeroHUD() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);
  const reduced = useReducedMotion();

  // Full opacity 0 → 0.08, fade to 0 by 0.16 (same window as title)
  const opacity =
    scrollProgress < 0.08
      ? 1
      : Math.max(0, 1 - (scrollProgress - 0.08) / 0.08);

  if (reduced || opacity === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Corner L-markers — cyan, animated stagger on mount */}
      <CornerMarker position="top-left" delay={0.15} />
      <CornerMarker position="top-right" delay={0.25} />
      <CornerMarker position="bottom-left" delay={0.35} />
      <CornerMarker position="bottom-right" delay={0.45} />

      {/* Top-right telemetry readout */}
      <motion.div
        className="absolute top-24 right-8 md:right-12 text-right"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.4, 0, 1] }}
      >
        <div className="text-[9px] tracking-[0.3em] uppercase text-cyan-400/70 leading-[1.8] space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
            <span>System · Online</span>
          </div>
          <div>Drive · Electric AWD</div>
          <div>Powertrain · Supercapacitor</div>
          <div>Chassis · Carbon · Monocoque</div>
        </div>
      </motion.div>

      {/* Bottom-left label stamp */}
      <motion.div
        className="absolute bottom-20 left-8 md:left-12"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.75, ease: [0.25, 0.4, 0, 1] }}
      >
        <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 leading-[1.8]">
          <div className="text-cyan-400/80">TM · 001 / ∞</div>
          <div className="mt-1">Millennium Series</div>
        </div>
      </motion.div>

      {/* Bottom-right scan progress */}
      <motion.div
        className="absolute bottom-20 right-8 md:right-12 text-right"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.85, ease: [0.25, 0.4, 0, 1] }}
      >
        <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 leading-[1.8]">
          <div>Scan · Active</div>
          <div className="text-cyan-400/80 mt-1">
            {(scrollProgress * 100).toFixed(1)}%
          </div>
        </div>
      </motion.div>

      {/* Horizontal scan line — slow vertical sweep */}
      <div className="absolute inset-x-0 pointer-events-none hero-hud-scanline">
        <div
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,232,255,0.35) 20%, rgba(0,232,255,0.65) 50%, rgba(0,232,255,0.35) 80%, transparent 100%)',
            boxShadow: '0 0 22px rgba(0,232,255,0.35)',
          }}
        />
      </div>
    </div>
  );
}

function CornerMarker({
  position,
  delay,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  delay: number;
}) {
  const positionClasses = {
    'top-left': 'top-6 left-6 md:top-10 md:left-10 border-l-[1.5px] border-t-[1.5px]',
    'top-right': 'top-6 right-6 md:top-10 md:right-10 border-r-[1.5px] border-t-[1.5px]',
    'bottom-left':
      'bottom-6 left-6 md:bottom-10 md:left-10 border-l-[1.5px] border-b-[1.5px]',
    'bottom-right':
      'bottom-6 right-6 md:bottom-10 md:right-10 border-r-[1.5px] border-b-[1.5px]',
  }[position];

  const initialPos = {
    'top-left': { x: -8, y: -8 },
    'top-right': { x: 8, y: -8 },
    'bottom-left': { x: -8, y: 8 },
    'bottom-right': { x: 8, y: 8 },
  }[position];

  return (
    <motion.div
      className={`absolute w-10 h-10 md:w-14 md:h-14 border-cyan-400/65 ${positionClasses}`}
      initial={{ opacity: 0, ...initialPos }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0, 1] }}
      style={{
        filter: 'drop-shadow(0 0 6px rgba(0,232,255,0.45))',
      }}
    />
  );
}
