'use client';

import { EffectComposer, Bloom, ToneMapping, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useConfigStore } from '@/store/useConfigStore';

export default function PostProcessing() {
  const isMobile = useConfigStore((s) => s.isMobile);

  if (isMobile) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.4}
          mipmapBlur
          radius={0.85}
          levels={3}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
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
  );
}
