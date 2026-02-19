'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Smoothly interpolates a THREE.Color toward a target hex color.
 * Frame-rate independent exponential ease (300ms feel).
 */
export function useSmoothColor(targetHex: string): THREE.Color {
  const currentColor = useRef(new THREE.Color(targetHex));
  const targetColor = useRef(new THREE.Color(targetHex));

  targetColor.current.set(targetHex);

  useFrame((_, delta) => {
    // Exponential ease: ~95% there in 300ms
    const t = 1 - Math.exp(-10 * delta);
    currentColor.current.lerp(targetColor.current, t);
  });

  return currentColor.current;
}
