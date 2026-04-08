'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScrollStore } from '@/store/useScrollStore';
import { useConfigStore } from '@/store/useConfigStore';

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
  | 'footer-collapse';

function getScrollZone(p: number): ScrollZone {
  if (p < 0.18) return 'hero';
  if (p < 0.25) return 'intro';
  if (p < 0.35) return 'design-aero';
  if (p < 0.45) return 'design-lights';
  if (p < 0.55) return 'design-wing';
  if (p < 0.60) return 'color';
  if (p < 0.75) return 'configurator';
  if (p < 0.85) return 'specs';
  if (p < 0.95) return 'specs-explode';
  return 'footer-collapse';
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
      store.setBodyColor('#1a1a1a');
      store.setAccentColor('#ff6600');
      store.setLightColor('#ff6600');
      store.setLightIntensity(5.0);
      store.resetInteractive();
      store.setWingsOpen(false);
      break;

    case 'intro':
      store.setBodyColor('#1a1a1a');
      store.setAccentColor('#ff6600');
      store.setLightColor('#ff6600');
      store.setLightIntensity(5.0);
      store.setWingsOpen(false);
      if (isMobile) {
        // Skip door open on mobile (fewer transforms)
        store.resetInteractive();
      } else {
        store.resetInteractive();
        store.setPartOpen('doorL', true);
        store.setPartOpen('doorR', true);
      }
      break;

    case 'design-aero':
      if (isMobile) {
        // Skip color changes on mobile - keep defaults
        store.setBodyColor('#1a1a1a');
        store.setAccentColor('#ff6600');
        store.setLightColor('#ff6600');
      } else {
        store.setBodyColor('#cc0000');
        store.setAccentColor('#ff6600');
        store.setLightColor('#ff3300');
      }
      store.setLightIntensity(5.0);
      store.resetInteractive();
      store.setWingsOpen(false);
      break;

    case 'design-lights':
      store.setBodyColor('#2d1b4e');
      store.setAccentColor('#8b1aff');
      store.setLightColor('#00ffff');
      store.setLightIntensity(8.0);
      store.resetInteractive();
      store.setPartOpen('trunk', true);
      store.setWingsOpen(false);
      break;

    case 'design-wing':
      if (isMobile) {
        // Skip color changes on mobile, skip skirts
        store.setBodyColor('#1a1a1a');
        store.setAccentColor('#ff6600');
        store.setLightColor('#ff6600');
        store.setLightIntensity(5.0);
        store.resetInteractive();
      } else {
        store.setBodyColor('#f5f5f5');
        store.setAccentColor('#ff6600');
        store.setLightColor('#1a8bff');
        store.setLightIntensity(5.0);
        store.resetInteractive();
        store.setPartOpen('skirtL', true);
        store.setPartOpen('skirtR', true);
      }
      store.setWingsOpen(true);
      break;

    case 'color':
      store.setBodyColor('#1a1a1a');
      store.setAccentColor('#ff6600');
      store.setLightColor('#ff6600');
      store.setLightIntensity(5.0);
      store.resetInteractive();
      store.setWingsOpen(false);
      break;

    case 'specs':
      store.setBodyColor('#1a1a1a');
      store.setAccentColor('#ff6600');
      store.setLightColor('#ff6600');
      store.setLightIntensity(5.0);
      store.resetInteractive();
      store.setWingsOpen(false);
      break;

    case 'specs-explode':
      // Colors stay at defaults; explode handled in continuous section
      store.setBodyColor('#1a1a1a');
      store.setAccentColor('#ff6600');
      store.setLightColor('#ff6600');
      store.setLightIntensity(5.0);
      store.setWingsOpen(false);
      // Reset part toggles but NOT explodeAmount (continuous interpolation below)
      store.setPartOpen('doorL', false);
      store.setPartOpen('doorR', false);
      store.setPartOpen('trunk', false);
      store.setPartOpen('skirtL', false);
      store.setPartOpen('skirtR', false);
      break;

    case 'footer-collapse':
      // Colors stay at defaults; explode collapses back
      store.setBodyColor('#1a1a1a');
      store.setAccentColor('#ff6600');
      store.setLightColor('#ff6600');
      store.setLightIntensity(5.0);
      store.setWingsOpen(false);
      break;
  }
}

export default function ScrollEffects() {
  const prevZone = useRef<ScrollZone>('hero');
  const lastExplode = useRef(0);

  useFrame(() => {
    const p = useScrollStore.getState().scrollProgress;
    const zone = getScrollZone(p);
    const isMobile = useConfigStore.getState().isMobile;
    const maxExplode = isMobile ? 0.2 : 0.4;

    // Skip configurator section - user has full control there
    if (zone === 'configurator') {
      prevZone.current = zone;
      return;
    }

    // Zone-based threshold effects (only fire when zone changes)
    if (zone !== prevZone.current) {
      applyZoneState(zone, isMobile);
      prevZone.current = zone;
    }

    // Continuous effects: explode amount interpolation (throttled)
    if (zone === 'specs-explode') {
      const t = Math.min(Math.max((p - 0.85) / 0.10, 0), 1);
      const newExplode = t * maxExplode;
      if (Math.abs(newExplode - lastExplode.current) > 0.005) {
        useConfigStore.getState().setExplodeAmount(newExplode);
        lastExplode.current = newExplode;
      }
    } else if (zone === 'footer-collapse') {
      const t = Math.min(Math.max(1 - (p - 0.95) / 0.05, 0), 1);
      const newExplode = t * maxExplode;
      if (Math.abs(newExplode - lastExplode.current) > 0.005) {
        useConfigStore.getState().setExplodeAmount(newExplode);
        lastExplode.current = newExplode;
      }
    }
  });

  return null;
}
