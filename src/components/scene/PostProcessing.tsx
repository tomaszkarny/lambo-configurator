'use client';

import { useRef, type RefObject } from 'react';
import { EffectComposer, Bloom, ToneMapping, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode, BloomEffect } from 'postprocessing';
import { useFrame } from '@react-three/fiber';
import { useConfigStore } from '@/store/useConfigStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getFinaleBloomT } from '@/lib/finale-signal';

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
    const t = getFinaleBloomT(); // 0..1
    const eased = 1 - Math.pow(1 - t, 4);
    bloom.intensity = baseIntensity * (1 + eased * 1.4);
  });

  return null;
}

export default function PostProcessing() {
  const isMobile = useConfigStore((s) => s.isMobile);
  const bloomRef = useRef<BloomEffect | null>(null);

  if (isMobile) {
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
        </EffectComposer>
        <BloomDriver bloomRef={bloomRef} baseIntensity={0.8} />
      </>
    );
  }

  return (
    <>
      <EffectComposer multisampling={0}>
        <Bloom
          ref={bloomRef}
          intensity={1.2}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.85}
          levels={5}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
      </EffectComposer>
      <BloomDriver bloomRef={bloomRef} baseIntensity={1.2} />
    </>
  );
}
