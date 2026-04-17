'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CarModel from '@/components/scene/CarModel';
// Reveal experiments kept as fallback files on disk (not mounted):
//   - AtmosphericFog  (Drei volumetric clouds — too soft for the intended drama)
//   - ClothReveal  (5 cloth-sim iterations, none felt natural)
//   - ParticleReveal  (cyan/magenta iridescent particles, felt cheap)
//   - Sparkles (Drei dust motes — noise without intent)
// Current hero direction: custom GPU smoke cloud wrapping the car.
import SmokeParticles from '@/components/scene/SmokeParticles';
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
          position: [0, 1.9, 8.5],
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{
          alpha: false,
          antialias: false,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          localClippingEnabled: true,
        }}
        shadows
      >
        <fogExp2 attach="fog" args={['#141210', 0.052]} />
        <Suspense fallback={null}>
          <CarModel />
          <SmokeParticles />
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
