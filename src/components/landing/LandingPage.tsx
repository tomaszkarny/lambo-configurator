'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { sections } from '@/config/landing-content';
import { useResponsive } from '@/hooks/useResponsive';
import { useConfigStore } from '@/store/useConfigStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import NavHeader from '@/components/ui/NavHeader';
import ScrollProgressBar from './ScrollProgressBar';
import FinalReveal from './FinalReveal';

import HeroSection from './HeroSection';
import IntroSection from './IntroSection';
import DesignSection from './DesignSection';
import ColorShowcaseSection from './ColorShowcaseSection';
import ConfiguratorSection from './ConfiguratorSection';
import SpecsSection from './SpecsSection';
import FooterSection from './FooterSection';

// Dynamic import for ScrollCanvas (Three.js - no SSR)
const ScrollCanvas = dynamic(() => import('./ScrollCanvas'), { ssr: false });

// Map section IDs to their components
const sectionComponents: Record<string, React.ComponentType> = {
  hero: HeroSection,
  intro: IntroSection,
  design: DesignSection,
  'color-showcase': ColorShowcaseSection,
  configurator: ConfiguratorSection,
  specs: SpecsSection,
  footer: FooterSection,
};

// Map section IDs to accessible labels
const sectionLabels: Record<string, string> = {
  hero: 'Hero',
  intro: 'Introduction',
  design: 'Design Features',
  'color-showcase': 'Color Showcase',
  configurator: 'Configurator',
  specs: 'Specifications',
  footer: 'Footer',
};

export default function LandingPage() {
  useSmoothScroll();
  useScrollProgress();
  const { isMobile } = useResponsive();

  // Sync isMobile to store for 3D scene components
  useEffect(() => {
    useConfigStore.getState().setIsMobile(isMobile);
  }, [isMobile]);

  return (
    <>
      <LoadingScreen />
      <NavHeader />
      <ScrollProgressBar />
      <FinalReveal />

      <div id="page-wrapper" style={{ position: 'relative' }}>
        <main>
          {/* Canvas in sticky container - scrolls with content but stays on screen */}
          <div style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 0 }}>
            <ScrollCanvas />
          </div>

          {/* Content overlay ON TOP of the sticky canvas */}
          <div
            id="scroll-content"
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: '-100vh',
              pointerEvents: 'none',
            }}
          >
            {sections.map((section) => {
              const Component = sectionComponents[section.id];
              const height = (isMobile && section.mobileHeight) || section.height;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  style={{ height }}
                  className="relative w-full"
                  aria-label={sectionLabels[section.id]}
                >
                  {Component && <Component />}
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
