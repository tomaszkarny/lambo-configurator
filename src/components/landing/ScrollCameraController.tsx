'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useScrollStore } from '@/store/useScrollStore';
import { interpolateCamera } from '@/config/scroll-camera-path';

export default function ScrollCameraController() {
  const { camera, invalidate } = useThree();

  useFrame(() => {
    const isConfigurator = useScrollStore.getState().isConfigurator;
    if (isConfigurator) return;

    const scrollProgress = useScrollStore.getState().scrollProgress;
    const { position, target } = interpolateCamera(scrollProgress);

    camera.position.copy(position);
    camera.lookAt(target);

    invalidate();
  });

  return null;
}
