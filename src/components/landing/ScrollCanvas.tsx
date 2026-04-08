'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CarModel from '@/components/scene/CarModel';
import Lighting from '@/components/scene/Lighting';
import Environment from '@/components/scene/Environment';
import Floor from '@/components/scene/Floor';
import PostProcessing from '@/components/scene/PostProcessing';
import CameraController from '@/components/scene/CameraController';
import ScrollCameraController from './ScrollCameraController';
import ScrollEffects from './ScrollEffects';
import { useScrollStore } from '@/store/useScrollStore';
import { useConfigStore } from '@/store/useConfigStore';

function CameraSwitch() {
  const isConfigurator = useScrollStore((s) => s.isConfigurator);

  // ScrollCameraController is always mounted but returns early when isConfigurator is true.
  // CameraController (with OrbitControls) is only mounted in configurator mode
  // to avoid conflicting with scroll-driven camera updates.
  return (
    <>
      <ScrollCameraController />
      {isConfigurator && <CameraController />}
    </>
  );
}

export default function ScrollCanvas() {
  const isMobile = useConfigStore((s) => s.isMobile);

  return (
    <div className="w-full h-full">
      <Canvas
        frameloop="always"
        flat
        camera={{
          fov: 35,
          near: 0.1,
          far: 100,
          position: [8, 5, 12],
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{
          alpha: true,
          antialias: false,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        shadows
      >
        <Suspense fallback={null}>
          <CarModel />
          <ScrollEffects />
          <Lighting />
          <Environment />
          <Floor />
          <PostProcessing />
        </Suspense>
        <CameraSwitch />
      </Canvas>
    </div>
  );
}
