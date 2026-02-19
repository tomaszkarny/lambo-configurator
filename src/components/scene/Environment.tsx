'use client';

import { Environment as DreiEnvironment } from '@react-three/drei';

export default function Environment() {
  return (
    <DreiEnvironment
      preset="night"
      background={false}
      environmentIntensity={1.2}
    />
  );
}
