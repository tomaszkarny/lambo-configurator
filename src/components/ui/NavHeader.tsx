'use client';

import { useState } from 'react';
import { useScrollStore } from '@/store/useScrollStore';
import { scrollToProgress } from '@/lib/scroll-nav';
import NavOverlay, { type NavSection } from './NavOverlay';

/**
 * Target progress values are chosen inside each section's safe zone so that
 * clicking a dot/link lands cleanly in the intended scroll zone. Configurator
 * must be 0.888 (mid of 0.833-0.944) to avoid the color-overwrite bug.
 */
const SECTIONS: NavSection[] = [
  { id: 'hero', label: 'Home', progress: 0.0 },
  { id: 'intro', label: 'Vision', progress: 0.28 },
  { id: 'design', label: 'Design', progress: 0.5 },
  { id: 'color', label: 'Colors', progress: 0.75 },
  { id: 'configurator', label: 'Configure', progress: 0.888 },
  { id: 'specs', label: 'Specs', progress: 0.96 },
  { id: 'finale', label: 'Reveal', progress: 0.998 },
];

export default function NavHeader() {
  const [open, setOpen] = useState(false);
  const activeSection = useScrollStore((s) => s.activeSection);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between
          px-6 md:px-10 py-4 pointer-events-none"
      >
        {/* Wordmark (left) */}
        <button
          type="button"
          onClick={() => scrollToProgress(0)}
          className="pointer-events-auto text-left group cursor-pointer"
          aria-label="Lamborghini Terzo Millennio — scroll to top"
        >
          <span className="block text-sm font-bold tracking-[0.3em] text-white/90 uppercase
            group-hover:text-white transition-colors">
            Lamborghini
          </span>
          <span className="block text-[10px] tracking-[0.2em] text-white/55 uppercase mt-0.5
            group-hover:text-white/70 transition-colors">
            Terzo Millennio
          </span>
        </button>

        {/* Section dots (desktop only, hidden under md) */}
        <nav
          className="hidden md:flex items-center gap-3 pointer-events-auto"
          aria-label="Section navigation"
        >
          {SECTIONS.map((section, i) => {
            const isActive = i === activeSection;
            return (
              <button
                key={section.id}
                onClick={() => scrollToProgress(section.progress)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#ff6600] scale-[1.6] shadow-[0_0_10px_rgba(255,102,0,0.8)]'
                    : 'bg-white/25 hover:bg-white/55 hover:scale-110'
                }`}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? 'true' : undefined}
                title={section.label}
              />
            );
          })}
        </nav>

        {/* Hamburger (all viewports) */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto p-2 -mr-2 group cursor-pointer"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="nav-overlay"
        >
          <span className="block w-6 h-px bg-white/80 mb-1.5 transition-all duration-200
            group-hover:bg-[#ff6600] group-hover:w-7" />
          <span className="block w-6 h-px bg-white/80 mb-1.5 transition-all duration-200
            group-hover:bg-[#ff6600]" />
          <span className="block w-6 h-px bg-white/80 transition-all duration-200
            group-hover:bg-[#ff6600] group-hover:w-5 group-hover:ml-auto" />
        </button>
      </header>

      <NavOverlay open={open} onClose={() => setOpen(false)} sections={SECTIONS} />
    </>
  );
}
