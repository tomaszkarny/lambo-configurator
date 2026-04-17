'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/store/useScrollStore';
import { interpolateCamera } from '@/config/scroll-camera-path';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function ScrollCameraController() {
  const { camera, invalidate } = useThree();
  const reduced = useReducedMotion();

  const smoothPos = useRef(new THREE.Vector3(0, 1.9, 8.5));
  const smoothTarget = useRef(new THREE.Vector3(0, 0.6, 0));
  const clock = useRef(0);

  useFrame((_, delta) => {
    const isConfigurator = useScrollStore.getState().isConfigurator;
    if (isConfigurator) return;

    const scrollProgress = useScrollStore.getState().scrollProgress;
    const { position, target } = interpolateCamera(scrollProgress);

    // Very snappy for establishing shot (k=20), cinematic for orbital (k=12),
    // smooth for rest of page (k=6).
    const k = scrollProgress < 0.03 ? 20 : scrollProgress < 0.22 ? 12 : 6;
    const alpha = 1 - Math.exp(-k * delta);

    smoothPos.current.lerp(position, alpha);
    smoothTarget.current.lerp(target, alpha);

    camera.position.copy(smoothPos.current);

    // Subtle camera breathing — organic, imperceptible micro-drift that prevents
    // the static-feel of pure mathematical orbit. Faded fully in hero zone,
    // tapers off to 0 after p=0.22. Disabled for reduced-motion users.
    if (!reduced && scrollProgress < 0.25) {
      clock.current += delta;
      const t = clock.current;
      const fade = 1 - Math.min(1, Math.max(0, (scrollProgress - 0.18) / 0.07));
      const amp = 0.014 * fade;

      // Three distinct sine waves at prime-like frequencies — avoids visible repetition
      const breathX = Math.sin(t * 0.37) * 0.6 + Math.sin(t * 0.71 + 1.3) * 0.4;
      const breathY = Math.sin(t * 0.29 + 0.7) * 0.5 + Math.sin(t * 0.83 + 2.1) * 0.5;
      const breathZ = Math.sin(t * 0.41 + 2.4) * 0.55 + Math.sin(t * 0.67) * 0.45;

      camera.position.x += breathX * amp;
      camera.position.y += breathY * amp * 0.6;
      camera.position.z += breathZ * amp;

      // Gentle target drift so the car subtly shifts in frame — editorial feel
      const tAmp = 0.006 * fade;
      smoothTarget.current.x += Math.sin(t * 0.23) * tAmp;
      smoothTarget.current.y += Math.sin(t * 0.31 + 1.1) * tAmp * 0.5;
    }

    camera.lookAt(smoothTarget.current);

    invalidate();
  });

  return null;
}
