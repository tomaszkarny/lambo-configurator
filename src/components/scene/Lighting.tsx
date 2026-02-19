'use client';

import { useConfigStore } from '@/store/useConfigStore';

export default function Lighting() {
  const isMobile = useConfigStore((s) => s.isMobile);
  const shadowSize = isMobile ? 1024 : 2048;

  return (
    <>
      {/* Ambient - prevents pure black areas */}
      <ambientLight intensity={0.3} />

      {/* Key light - right-upper, main illumination */}
      <spotLight
        position={[5, 8, 5]}
        intensity={2.5}
        angle={0.5}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-bias={-0.0001}
      />

      {/* Fill light - left side, softer */}
      <spotLight
        position={[-5, 5, 3]}
        intensity={1.0}
        angle={0.6}
        penumbra={0.8}
      />

      {/* Rim light - behind, creates edge definition */}
      <spotLight
        position={[0, 4, -6]}
        intensity={1.2}
        angle={0.5}
        penumbra={0.6}
      />

      {/* Top fill - helps show body color evenly */}
      <directionalLight
        position={[0, 10, 0]}
        intensity={0.4}
      />
    </>
  );
}
