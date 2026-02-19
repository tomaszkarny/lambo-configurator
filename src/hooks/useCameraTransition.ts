'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CameraPreset } from '@/types/configurator';

/**
 * Smoothly transitions the camera to a target preset position.
 * Uses cubic ease-out over ~1.5s.
 */
export function useCameraTransition(preset: CameraPreset | null) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);
  const progress = useRef(1);

  useEffect(() => {
    if (!preset) return;
    targetPosition.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);
    progress.current = 0;
    isTransitioning.current = true;
  }, [preset]);

  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    progress.current = Math.min(progress.current + delta / 1.5, 1);
    // Cubic ease-out
    const t = 1 - Math.pow(1 - progress.current, 3);

    camera.position.lerp(targetPosition.current, t);

    if (progress.current >= 1) {
      isTransitioning.current = false;
      camera.position.copy(targetPosition.current);
    }
  });

  return isTransitioning;
}
