'use client';

import { useRef, type RefObject } from 'react';
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode, BloomEffect } from 'postprocessing';
import { useFrame } from '@react-three/fiber';
import { useConfigStore } from '@/store/useConfigStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getFinaleBloomT, getHeroRevealBloomT } from '@/lib/finale-signal';

/**
 * Reads the finale bloom signal each frame and mutates the live Bloom
 * effect intensity. Using a ref mutation instead of React state keeps the
 * effect chain stable — Zustand-based React state on a postprocessing pass
 * would remount the composer every frame during the ramp.
 *
 * Ramp curve: ease-out quartic, baseIntensity × (1 + eased × 1.4).
 * Desktop: 1.2 → 2.88. Mobile: 0.8 → 1.92.
 */
function BloomDriver({
  bloomRef,
  baseIntensity,
}: {
  bloomRef: RefObject<BloomEffect | null>;
  baseIntensity: number;
}) {
  const reduced = useReducedMotion();

  useFrame(() => {
    const bloom = bloomRef.current;
    if (!bloom) return;
    if (reduced) {
      bloom.intensity = baseIntensity;
      return;
    }
    const finaleT = getFinaleBloomT();
    const heroT = getHeroRevealBloomT();
    const finaleEased = 1 - Math.pow(1 - finaleT, 4);
    const surge = Math.max(finaleEased, heroT);
    bloom.intensity = baseIntensity * (1 + surge * 1.4);
  });

  return null;
}

export default function PostProcessing() {
  const isMobile = useConfigStore((s) => s.isMobile);
  const bloomRef = useRef<BloomEffect | null>(null);

  if (isMobile) {
    // Mobile: skip DOF + Vignette for performance, keep Bloom + ToneMapping
    return (
      <>
        <EffectComposer multisampling={0}>
          <Bloom
            ref={bloomRef}
            intensity={0.8}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.4}
            mipmapBlur
            radius={0.85}
            levels={3}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette eskil={false} offset={0.22} darkness={0.65} />
        </EffectComposer>
        <BloomDriver bloomRef={bloomRef} baseIntensity={0.8} />
      </>
    );
  }

  // Desktop: Bloom + Vignette + SMAA. No DepthOfField — car must stay crisp
  // through the entire hero scroll (user feedback 2026-04-14).
  return (
    <>
      <EffectComposer multisampling={0}>
        <Bloom
          ref={bloomRef}
          intensity={1.2}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.85}
          levels={5}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.2} darkness={0.78} />
        <SMAA />
      </EffectComposer>
      <BloomDriver bloomRef={bloomRef} baseIntensity={1.2} />
    </>
  );
}
