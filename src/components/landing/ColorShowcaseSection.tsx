'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfigStore } from '@/store/useConfigStore';
import { useScrollStore } from '@/store/useScrollStore';
import { bodyColors } from '@/config/colors';

const CYCLE_INTERVAL = 4000;
const USER_IDLE_RESUME_MS = 6000;
const SWIPE_THRESHOLD_PX = 45;

export default function ColorShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const activeSection = useScrollStore((s) => s.activeSection);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeRootRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragMoved = useRef(false);

  const isSectionActive = activeSection === 3;

  const goToIndex = useCallback((idx: number) => {
    setActiveIndex(((idx % bodyColors.length) + bodyColors.length) % bodyColors.length);
  }, []);

  const flagUserInteraction = useCallback(() => {
    setUserInteracted(true);
    if (idleResumeRef.current) clearTimeout(idleResumeRef.current);
    idleResumeRef.current = setTimeout(() => {
      setUserInteracted(false);
    }, USER_IDLE_RESUME_MS);
  }, []);

  // Auto-cycle (paused while user actively interacting)
  useEffect(() => {
    if (!isSectionActive || userInteracted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bodyColors.length);
    }, CYCLE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isSectionActive, userInteracted]);

  // Apply color to 3D car when section is active
  useEffect(() => {
    if (isSectionActive) {
      useConfigStore.getState().setBodyColor(bodyColors[activeIndex].hex);
    }
  }, [activeIndex, isSectionActive]);

  // Cleanup idle timer on unmount
  useEffect(() => {
    return () => {
      if (idleResumeRef.current) clearTimeout(idleResumeRef.current);
    };
  }, []);

  // Mouse + touch swipe — left/right gesture cycles colors
  useEffect(() => {
    const el = swipeRootRef.current;
    if (!el) return;

    const startDrag = (x: number) => {
      dragStartX.current = x;
      dragMoved.current = false;
    };

    const moveDrag = (x: number) => {
      if (dragStartX.current === null) return;
      if (Math.abs(x - dragStartX.current) > 6) dragMoved.current = true;
    };

    const endDrag = (x: number) => {
      if (dragStartX.current === null) return;
      const delta = x - dragStartX.current;
      const startX = dragStartX.current;
      dragStartX.current = null;
      if (Math.abs(delta) >= SWIPE_THRESHOLD_PX && dragMoved.current) {
        flagUserInteraction();
        // swipe left (delta<0) → next color; swipe right → previous
        setActiveIndex((prev) => {
          const next = delta < 0 ? prev + 1 : prev - 1;
          return ((next % bodyColors.length) + bodyColors.length) % bodyColors.length;
        });
      }
      void startX;
    };

    const onTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX);
    const onTouchEnd = (e: TouchEvent) => endDrag(e.changedTouches[0].clientX);
    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX);
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX);
    const onMouseUp = (e: MouseEvent) => endDrag(e.clientX);

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [flagUserInteraction]);

  // Keyboard navigation — left/right arrow when section active
  useEffect(() => {
    if (!isSectionActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        flagUserInteraction();
        setActiveIndex((prev) => (prev + 1) % bodyColors.length);
      } else if (e.key === 'ArrowLeft') {
        flagUserInteraction();
        setActiveIndex(
          (prev) => (prev - 1 + bodyColors.length) % bodyColors.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSectionActive, flagUserInteraction]);

  const activeColor = bodyColors[activeIndex];

  return (
    <section
      ref={swipeRootRef}
      className="relative w-full h-full flex items-end justify-end pointer-events-auto select-none cursor-grab active:cursor-grabbing"
      aria-label="Available body colors — swipe or click to change"
      role="region"
    >
      <div className="pb-20 pr-6 md:pb-20 md:pr-20">
        {/* Color name with crossfade */}
        <div className="relative h-16 md:h-20 flex items-end mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeColor.name}
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0, 1] }}
            >
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-black"
                  style={{ backgroundColor: activeColor.hex }}
                />
              </div>
              <h3 className="text-3xl md:text-5xl font-light text-white tracking-tight">
                {activeColor.name}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Color dots — clickable buttons with hover feedback */}
        <div className="flex gap-1 items-center">
          {bodyColors.map((color, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  if (dragMoved.current) {
                    e.preventDefault();
                    return;
                  }
                  flagUserInteraction();
                  goToIndex(i);
                }}
                aria-label={`Select color: ${color.name}`}
                aria-pressed={isActive}
                className="relative flex items-center justify-center w-9 h-9 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-3.5 h-3.5 ring-1 ring-white/70 ring-offset-2 ring-offset-black'
                      : 'w-2.5 h-2.5 opacity-50 group-hover:opacity-100 group-hover:scale-150'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            );
          })}
        </div>

        {/* Section label + interaction hint */}
        <p
          className="mt-6 text-[11px] tracking-[0.3em] uppercase text-white/50 flex items-center gap-3 flex-wrap"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          <span>Available Colors</span>
          <span className="text-white/30 normal-case tracking-[0.15em]">
            · click · swipe ←→ · ⇦⇨
          </span>
        </p>
      </div>
    </section>
  );
}
