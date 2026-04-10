'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/store/useScrollStore';
import { interpolateCamera } from '@/config/scroll-camera-path';

export default function ScrollCameraController() {
  const { camera, invalidate } = useThree();

  // Smooth position and target refs — init with keyframe 0 values
  const smoothPos = useRef(new THREE.Vector3(3.5, 1.8, 5));
  const smoothTarget = useRef(new THREE.Vector3(0, 1.0, 0));

  useFrame((_, delta) => {
    const isConfigurator = useScrollStore.getState().isConfigurator;
    if (isConfigurator) return;

    const scrollProgress = useScrollStore.getState().scrollProgress;
    const { position, target } = interpolateCamera(scrollProgress);

    // Exponential damping — creates cinematic camera follow
    const alpha = 1 - Math.exp(-6 * delta);

    smoothPos.current.lerp(position, alpha);
    smoothTarget.current.lerp(target, alpha);

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothTarget.current);

    invalidate();
  });

  return null;
}
