'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigStore } from '@/store/useConfigStore';
import { cameraPresets } from '@/config/camera-presets';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export default function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate } = useThree();
  const cameraPreset = useConfigStore((s) => s.cameraPreset);
  const autoRotate = useConfigStore((s) => s.autoRotate);

  const startPos = useRef(new THREE.Vector3(4, 2, 6));
  const startLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const targetPos = useRef(new THREE.Vector3(4, 2, 6));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const isAnimating = useRef(false);
  const animProgress = useRef(1);

  useEffect(() => {
    const preset = cameraPresets.find((p) => p.name === cameraPreset);
    if (!preset) return;
    // Capture current position as start
    startPos.current.copy(camera.position);
    if (controlsRef.current) {
      startLookAt.current.copy(controlsRef.current.target);
    }
    targetPos.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);
    animProgress.current = 0;
    isAnimating.current = true;
    invalidate();
  }, [cameraPreset, camera, invalidate]);

  useFrame((state, delta) => {
    // Invalidate continuously while auto-rotate is active
    if (autoRotate && !isAnimating.current) {
      state.invalidate();
    }

    if (!isAnimating.current || !controlsRef.current) return;

    animProgress.current = Math.min(animProgress.current + delta / 1.2, 1);
    const t = 1 - Math.pow(1 - animProgress.current, 3); // cubic ease-out

    // Direct interpolation - guarantees reaching the target at t=1
    camera.position.lerpVectors(startPos.current, targetPos.current, t);
    controlsRef.current.target.lerpVectors(startLookAt.current, targetLookAt.current, t);
    controlsRef.current.update();

    state.invalidate();

    if (animProgress.current >= 1) {
      isAnimating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={0.5}
      maxDistance={12}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 + 0.3}
      autoRotate={autoRotate && !isAnimating.current}
      autoRotateSpeed={0.5}
      target={[0, 0.5, 0]}
      makeDefault
    />
  );
}
