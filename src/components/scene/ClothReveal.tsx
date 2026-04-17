'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/store/useScrollStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CLOTH_PATH = '/models/lambo_cloth_v2.glb';
const START = 0.0;
const END = 0.20;
const VISIBILITY_END = 0.23;
const KEY_COUNT = 12;

const SILK_COLOR = '#c8c3b5';
const CLOTH_SCALE = 1.0;

/**
 * Morph easing: brief hold for establishing shot, then natural
 * physical peel driven purely by the Blender morph targets.
 */
function morphEase(raw: number): number {
  if (raw < 0.08) return 0; // hold draped for establishing shot
  const t = (raw - 0.08) / 0.92;
  return Math.pow(t, 0.85); // slight ease-in for natural acceleration
}

export default function ClothReveal() {
  const { scene } = useGLTF(CLOTH_PATH);
  const reduced = useReducedMotion();
  const meshRef = useRef<THREE.Mesh | null>(null);
  const originalMat = useRef<THREE.Material | null>(null);

  const groundClip = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.1),
    []
  );

  const silkMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(SILK_COLOR),
        roughness: 0.35,
        metalness: 0.0,
        sheen: 1.0,
        sheenColor: new THREE.Color('#f0ece0'),
        sheenRoughness: 0.3,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
        clippingPlanes: [groundClip],
      }),
    [groundClip]
  );

  useEffect(() => {
    let found: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (
        !found &&
        child instanceof THREE.Mesh &&
        child.morphTargetInfluences &&
        child.morphTargetInfluences.length > 0
      ) {
        found = child;
      }
    });

    if (!found) return;

    const clothMesh = found as THREE.Mesh;
    meshRef.current = clothMesh;
    originalMat.current = clothMesh.material as THREE.Material;
    clothMesh.material = silkMaterial;
    clothMesh.frustumCulled = false;
    clothMesh.visible = false;
    clothMesh.scale.setScalar(CLOTH_SCALE);
    clothMesh.position.set(0, 0, 0);

    return () => {
      if (originalMat.current) clothMesh.material = originalMat.current;
      silkMaterial.dispose();
      meshRef.current = null;
      originalMat.current = null;
    };
  }, [scene, silkMaterial]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !mesh.morphTargetInfluences) return;

    if (reduced) {
      mesh.visible = false;
      return;
    }

    const p = useScrollStore.getState().scrollProgress;
    const active = p < VISIBILITY_END;
    mesh.visible = active;
    if (!active) return;

    const raw = Math.min(Math.max((p - START) / (END - START), 0), 1);
    const t = morphEase(raw);

    // Morph targets: physical cloth peel from Blender simulation.
    // No shader clipping — pure physics-driven reveal.
    const frameIdx = t * (KEY_COUNT - 1);
    const lo = Math.floor(frameIdx);
    const hi = Math.min(KEY_COUNT - 1, lo + 1);
    const frac = frameIdx - lo;

    const influences = mesh.morphTargetInfluences;
    for (let i = 0; i < KEY_COUNT; i++) influences[i] = 0;
    influences[lo] = 1 - frac;
    if (hi !== lo) influences[hi] = frac;

    // Subtle drift to amplify the morph target motion
    const drift = t * t;
    mesh.position.set(
      drift * -0.5,
      drift * 0.3,
      t * -0.2,
    );
    mesh.rotation.z = drift * 0.1;
  });

  return <primitive object={scene} />;
}

useGLTF.preload(CLOTH_PATH);
