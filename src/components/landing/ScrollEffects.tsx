'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScrollStore } from '@/store/useScrollStore';
import { useConfigStore } from '@/store/useConfigStore';
import { setFinaleBloomT } from '@/lib/finale-signal';

type ScrollZone =
  | 'hero'
  | 'intro'
  | 'design-aero'
  | 'design-lights'
  | 'design-wing'
  | 'color'
  | 'configurator'
  | 'specs'
  | 'specs-explode'
  | 'footer-collapse'
  | 'finale';

/**
 * Zone boundaries derived from section heights in landing-content.ts:
 *   hero=200vh, intro=100vh, design=300vh, color-showcase=150vh,
 *   configurator=100vh, specs=100vh, footer=50vh  → total 1000vh
 * Scrollable range = 1000vh - 100vh (viewport) = 900vh.
 *
 *   Section start offsets → progress:
 *     hero          0vh   → 0.000
 *     intro       200vh   → 0.222
 *     design      300vh   → 0.333  (3 sub-zones of ~100vh each)
 *     color       600vh   → 0.667
 *     configurator750vh   → 0.833
 *     specs       850vh   → 0.944
 *     footer      950vh   → ~1.0
 */
function getScrollZone(p: number): ScrollZone {
  if (p < 0.222) return 'hero';
  if (p < 0.333) return 'intro';
  if (p < 0.444) return 'design-aero';
  if (p < 0.556) return 'design-lights';
  if (p < 0.667) return 'design-wing';
  if (p < 0.833) return 'color';
  if (p < 0.944) return 'configurator';
  if (p < 0.975) return 'specs';
  if (p < 0.99) return 'specs-explode';
  if (p < 0.997) return 'footer-collapse';
  return 'finale';
}

/**
 * Apply a full self-contained state for the given zone.
 * Every zone sets ALL relevant properties so that fast-scrolling
 * (skipping intermediate zones) never leaves stale state behind.
 */
function applyZoneState(zone: ScrollZone, isMobile: boolean) {
  const store = useConfigStore.getState();

  switch (zone) {
    case 'hero':
      store.batchUpdate({
        bodyColor: '#18181c',
        accentColor: '#00e8ff',
        lightColor: '#00e8ff',
        lightIntensity: 3.5,
        wingsOpen: false,
      });
      store.resetInteractive();
      break;

    case 'intro':
      store.batchUpdate({
        bodyColor: '#0a2f6b',
        accentColor: '#00ffee',
        lightColor: '#00ffee',
        lightIntensity: 6.0,
        wingsOpen: false,
      });
      store.resetInteractive();
      if (!isMobile) {
        store.setPartOpen('doorL', true);
        store.setPartOpen('doorR', true);
      }
      break;

    case 'design-aero':
      if (isMobile) {
        store.batchUpdate({
          bodyColor: '#1a1a1a',
          accentColor: '#ff6600',
          lightColor: '#ff6600',
          lightIntensity: 5.0,
          wingsOpen: false,
        });
      } else {
        store.batchUpdate({
          bodyColor: '#cc0000',
          accentColor: '#ff6600',
          lightColor: '#ff3300',
          lightIntensity: 5.0,
          wingsOpen: false,
        });
      }
      store.resetInteractive();
      break;

    case 'design-lights':
      store.batchUpdate({
        bodyColor: '#2d1b4e',
        accentColor: '#8b1aff',
        lightColor: '#00ffff',
        lightIntensity: 8.0,
        wingsOpen: false,
      });
      store.resetInteractive();
      store.setPartOpen('trunk', true);
      break;

    case 'design-wing':
      if (isMobile) {
        store.batchUpdate({
          bodyColor: '#1a1a1a',
          accentColor: '#ff6600',
          lightColor: '#ff6600',
          lightIntensity: 5.0,
          wingsOpen: true,
        });
        store.resetInteractive();
      } else {
        store.batchUpdate({
          bodyColor: '#f5f5f5',
          accentColor: '#ff6600',
          lightColor: '#1a8bff',
          lightIntensity: 5.0,
          wingsOpen: true,
        });
        store.resetInteractive();
        store.setPartOpen('skirtL', true);
        store.setPartOpen('skirtR', true);
      }
      break;

    case 'color':
      store.batchUpdate({
        bodyColor: '#e8c800',
        accentColor: '#ffcc00',
        lightColor: '#ffdd00',
        lightIntensity: 5.5,
        wingsOpen: false,
      });
      store.resetInteractive();
      break;

    case 'specs':
      store.batchUpdate({
        bodyColor: '#4a4a4a',
        accentColor: '#ffffff',
        lightColor: '#1a8bff',
        lightIntensity: 5.0,
        wingsOpen: false,
      });
      store.resetInteractive();
      break;

    case 'specs-explode':
      // Colors match specs theme; explode handled in continuous section
      store.batchUpdate({
        bodyColor: '#4a4a4a',
        accentColor: '#ffffff',
        lightColor: '#1a8bff',
        lightIntensity: 5.5,
        wingsOpen: false,
      });
      // Reset part toggles but NOT explodeAmount (continuous interpolation below)
      store.setPartOpen('doorL', false);
      store.setPartOpen('doorR', false);
      store.setPartOpen('trunk', false);
      store.setPartOpen('skirtL', false);
      store.setPartOpen('skirtR', false);
      break;

    case 'footer-collapse':
      // Colors stay at defaults; explode collapses back
      store.batchUpdate({
        bodyColor: '#1a1a1a',
        accentColor: '#ff6600',
        lightColor: '#ff6600',
        lightIntensity: 5.0,
        wingsOpen: false,
      });
      break;

    case 'finale':
      // Cinematic finale: deep carbon black body with hot orange signature
      // glow, warm amber key light crescendo, wing deployed. Bloom intensity
      // is ramped separately by BloomDriver via the finale-signal module.
      store.batchUpdate({
        bodyColor: '#0a0a0a',
        accentColor: '#ff6600',
        lightColor: '#ffaa33',
        lightIntensity: 9.5,
        wingsOpen: true,
      });
      store.resetInteractive();
      break;
  }
}

export default function ScrollEffects() {
  const prevZone = useRef<ScrollZone>('hero');
  const lastExplode = useRef(0);

  useFrame(() => {
    const scrollState = useScrollStore.getState();
    const p = scrollState.scrollProgress;
    const zone = getScrollZone(p);
    const isMobile = useConfigStore.getState().isMobile;
    const maxExplode = isMobile ? 0.2 : 0.4;

    // Skip when the configurator section is active — use the canonical
    // isConfigurator flag from useScrollStore (set by useScrollProgress
    // based on actual section boundaries) as the authoritative guard.
    // This is more robust than relying solely on local zone boundary math.
    if (scrollState.isConfigurator) {
      prevZone.current = zone;
      setFinaleBloomT(0); // bloom stays at base while user configures
      return;
    }

    // Zone-based threshold effects (only fire when zone changes)
    if (zone !== prevZone.current) {
      applyZoneState(zone, isMobile);
      prevZone.current = zone;
    }

    // Continuous cyan energy pulse — "system awakening" mid-reveal.
    // Peaks at p=0.06 for power-on moment, stays elevated through orbit.
    if (zone === 'hero' && p >= 0.03 && p <= 0.10) {
      const revealT = (p - 0.03) / 0.07;
      const boost = Math.sin(revealT * Math.PI);
      useConfigStore.getState().batchUpdate({
        lightColor: '#00e8ff',
        lightIntensity: 3.5 + boost * 2.5,
      });
    }

    // Continuous finale bloom ramp: 0 at p=0.92, 1 at p=1.0.
    // BloomDriver (inside PostProcessing) reads this each frame and mutates
    // the live BloomEffect intensity without triggering a React render.
    if (p >= 0.92) {
      const tFinale = Math.min(Math.max((p - 0.92) / 0.08, 0), 1);
      setFinaleBloomT(tFinale);
    } else {
      setFinaleBloomT(0);
    }

    // Continuous effects: explode amount interpolation (throttled)
    // specs-explode: 0.975 to 0.99, footer-collapse: 0.99 to 1.0
    if (zone === 'specs-explode') {
      const t = Math.min(Math.max((p - 0.975) / 0.015, 0), 1);
      const newExplode = t * maxExplode;
      if (Math.abs(newExplode - lastExplode.current) > 0.005) {
        useConfigStore.getState().setExplodeAmount(newExplode);
        lastExplode.current = newExplode;
      }
    } else if (zone === 'footer-collapse') {
      const t = Math.min(Math.max(1 - (p - 0.99) / 0.01, 0), 1);
      const newExplode = t * maxExplode;
      if (Math.abs(newExplode - lastExplode.current) > 0.005) {
        useConfigStore.getState().setExplodeAmount(newExplode);
        lastExplode.current = newExplode;
      }
    }
  });

  return null;
}
