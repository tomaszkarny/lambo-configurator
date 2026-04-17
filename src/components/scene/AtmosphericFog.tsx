'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Clouds } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useConfigStore } from '@/store/useConfigStore';

/**
 * Volumetric atmospheric fog using Drei `<Cloud>` — billboarded volume sprites
 * that always face the camera, eliminating the "horizontal layer" artifact of
 * stacked plane shaders. Reads as real cinematic smoke from any orbit angle.
 *
 * Multiple cloud instances at different positions + seeds break up the pattern
 * so the fog never repeats. Cyan tint matches the car's neon accents and
 * blends additively with bloom for a glowing haze.
 */
export default function AtmosphericFog() {
  const reduced = useReducedMotion();
  const isMobile = useConfigStore((s) => s.isMobile);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (reduced) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    // Cinematic wind drift — clouds breathe and sway like real smoke moved by air currents
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.07) * 0.12;
    groupRef.current.rotation.z = Math.cos(t * 0.05) * 0.04;
    // Subtle horizontal wind sweep + gentle rise (smoke physics)
    groupRef.current.position.x = Math.sin(t * 0.12) * 0.6;
    groupRef.current.position.y = Math.sin(t * 0.09 + 1.3) * 0.18;
    groupRef.current.position.z = Math.cos(t * 0.08 + 0.7) * 0.4;
  });

  // Heavier smoke for cinematic feel — more volume, opacity, and clouds.
  // Tested: limit ~220 desktop / 100 mobile stays under context-lost threshold
  // when paired with simplified Sparkles + existing post-processing stack.
  return (
    <group ref={groupRef}>
      <Clouds material={THREE.MeshBasicMaterial} limit={isMobile ? 90 : 180}>
        {/* MAIN ground mass — positioned lower and offset so car center stays clear */}
        <Cloud
          seed={11}
          segments={isMobile ? 14 : 20}
          bounds={[12, 1.1, 9]}
          volume={6}
          color="#0d2a38"
          fade={34}
          speed={0.55}
          growth={5}
          opacity={0.72}
          position={[0, 0.15, 0]}
        />
        {/* Front-right body — cyan-tinted, slightly off to side (hero pocket) */}
        <Cloud
          seed={23}
          segments={isMobile ? 12 : 16}
          bounds={[6, 1.0, 6]}
          volume={4}
          color="#0e4258"
          fade={30}
          speed={0.7}
          growth={4.2}
          opacity={0.7}
          position={[5, 0.45, 2.2]}
        />
        {/* Rear-left rolling cloud — offset away from car center */}
        <Cloud
          seed={47}
          segments={isMobile ? 12 : 16}
          bounds={[6, 1.0, 6]}
          volume={3.8}
          color="#0a2c3a"
          fade={30}
          speed={0.5}
          growth={4}
          opacity={0.7}
          position={[-5, 0.35, -2.2]}
        />
        {!isMobile && (
          <>
            {/* Background atmospheric wall — deep perspective only */}
            <Cloud
              seed={73}
              segments={20}
              bounds={[15, 1.2, 4]}
              volume={6.5}
              color="#08222c"
              fade={48}
              speed={0.35}
              growth={5}
              opacity={0.68}
              position={[0, 0.6, -7.5]}
            />
            {/* Front foreground wisp — in viewer's face, offset from car axis */}
            <Cloud
              seed={91}
              segments={16}
              bounds={[8, 0.9, 3]}
              volume={3.8}
              color="#0e3340"
              fade={26}
              speed={0.9}
              growth={4}
              opacity={0.6}
              position={[0, 0.32, 6]}
            />
          </>
        )}
      </Clouds>
    </group>
  );
}
