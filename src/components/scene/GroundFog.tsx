'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Ground-hugging fog plane — studio "dry ice" layer beneath the car.
 * Pairs with SmokeParticles to give the shot a low horizontal haze that
 * reads as a real fog-machine setup instead of floating specks.
 *
 * Two scrolling fBM layers (different scale + direction) blended to give
 * turbulent flow. Radial edge fade keeps the plane boundary invisible.
 * A small clear "car hole" in the dead center prevents the subject from
 * being completely buried when viewed from low angles.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uTintInner;
  uniform vec3 uTintOuter;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract((p.x + p.y) * p.x);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = p * 2.05 + vec2(11.7, 7.1);
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 centered = vUv - 0.5;

    // Two scrolling layers — different scales and directions for organic flow
    vec2 flow1 = centered * 2.2 + vec2(uTime * 0.018, uTime * 0.012);
    vec2 flow2 = centered * 5.5 + vec2(-uTime * 0.009, uTime * 0.022);
    float density = fbm(flow1) * 0.7 + fbm(flow2) * 0.4;
    density = smoothstep(0.35, 0.78, density);

    // Radial fade at plane edges — hides the hard square boundary
    float edgeFade = 1.0 - smoothstep(0.22, 0.5, length(centered));

    // Car hole — small clear disc in the middle so auto doesn't drown
    float carHole = smoothstep(0.035, 0.105, length(centered));

    float alpha = density * edgeFade * carHole * uOpacity;
    if (alpha < 0.005) discard;

    vec3 col = mix(uTintOuter, uTintInner, density);
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function GroundFog() {
  const reduced = useReducedMotion();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTintInner: { value: new THREE.Color('#c8c4bd') },
          uTintOuter: { value: new THREE.Color('#1a1814') },
          uOpacity: { value: 0.55 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NormalBlending,
      }),
    []
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    if (reduced) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.02, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
      frustumCulled={false}
    >
      <planeGeometry args={[32, 32, 1, 1]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  );
}
