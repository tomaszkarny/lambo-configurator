'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CarModel from './CarModel';
import Lighting from './Lighting';
import Environment from './Environment';
import Floor from './Floor';
import CameraController from './CameraController';
import PostProcessing from './PostProcessing';
import { useConfigStore } from '@/store/useConfigStore';

export default function SceneCanvas() {
  const isMobile = useConfigStore((s) => s.isMobile);

  return (
    <Canvas
      frameloop="demand"
      flat
      camera={{
        fov: 35,
        near: 0.1,
        far: 100,
        position: [4, 2, 6],
      }}
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      gl={{
        antialias: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      shadows
      style={{ background: '#0a0a0a' }}
    >
      <Suspense fallback={null}>
        <CarModel />
        <Lighting />
        <Environment />
        <Floor />
        <PostProcessing />
      </Suspense>
      <CameraController />
    </Canvas>
  );
}
