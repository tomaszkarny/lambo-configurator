'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scrollToProgress } from '@/lib/scroll-nav';

export interface NavSection {
  id: string;
  label: string;
  progress: number;
}

interface NavOverlayProps {
  open: boolean;
  onClose: () => void;
  sections: NavSection[];
}

export default function NavOverlay({ open, onClose, sections }: NavOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Focus trap + Escape + body scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    // Defer focus until the panel has actually rendered into the DOM
    const focusFirstId = window.setTimeout(() => {
      const focusables = panel?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      focusables?.[0]?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(focusFirstId);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  const handleItemClick = (progress: number) => {
    scrollToProgress(progress);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="nav-overlay"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          transition={{ type: 'spring', damping: 28, stiffness: 180 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center
              text-white/70 hover:text-[#ff6600] transition-colors text-3xl leading-none cursor-pointer"
            aria-label="Close navigation menu"
          >
            ×
          </button>

          {/* Menu items */}
          <nav
            className="flex flex-col items-center gap-5 md:gap-6 px-6"
            aria-label="Primary"
          >
            {sections.map((section, i) => (
              <motion.button
                key={section.id}
                onClick={() => handleItemClick(section.progress)}
                className="text-3xl md:text-5xl font-extralight tracking-[0.12em] uppercase
                  text-white/80 hover:text-[#ff6600] transition-colors cursor-pointer"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduced ? 0 : 0.12 + i * 0.06,
                  duration: 0.5,
                  ease: [0.25, 0.4, 0, 1],
                }}
              >
                {section.label}
              </motion.button>
            ))}
          </nav>

          {/* Footer mark inside overlay */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em]
            text-white/40 uppercase pointer-events-none">
            Terzo Millennio · Concept
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
