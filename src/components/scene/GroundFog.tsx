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
  varying float vLift;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 pos = position;

    // Layered wave displacement — after the -π/2 rotation on the mesh,
    // local +Z becomes world +Y, so pushing pos.z lifts the vapor upward.
    // Two sine layers at different frequencies + a slow fbm-like beat
    // make the fog wisp up, not sit as a painted carpet.
    float wave1 = sin(uv.x * 5.2 + uTime * 0.35) * 0.45;
    float wave2 = sin(uv.y * 4.1 - uTime * 0.28) * 0.38;
    float wave3 = sin((uv.x + uv.y) * 3.1 + uTime * 0.19) * 0.3;
    float lift = wave1 + wave2 + wave3;

    pos.z += lift;
    vLift = lift;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uTintInner;
  uniform vec3 uTintOuter;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vLift;

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
    vec2 flow1 = centered * 2.6 + vec2(uTime * 0.022, uTime * 0.014);
    vec2 flow2 = centered * 6.5 + vec2(-uTime * 0.011, uTime * 0.026);
    float density = fbm(flow1) * 0.7 + fbm(flow2) * 0.4;
    // Tighter threshold → puffs of steam with gaps, not a continuous floor.
    density = smoothstep(0.48, 0.85, density);

    // Stronger radial fade — steam pools hug the center, not the edges
    float edgeFade = 1.0 - smoothstep(0.14, 0.42, length(centered));

    // Car hole — small clear disc in the middle so auto doesn't drown
    float carHole = smoothstep(0.045, 0.13, length(centered));

    // Lifted crests get a brightness boost — where the wisp rises it
    // catches more light, mimicking real vapor illumination.
    float liftBoost = smoothstep(-0.3, 0.8, vLift) * 0.35 + 0.85;

    float alpha = density * edgeFade * carHole * uOpacity * liftBoost;
    if (alpha < 0.004) discard;

    // Steam: brighter and cooler than the heavy smoke puffs above.
    vec3 col = mix(uTintOuter, uTintInner, density);
    col *= liftBoost;
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
          // Steam palette: bright highlight + mid warm-grey floor (never black),
          // low opacity so it reads as a vapor wisp, not a painted grey floor.
          uTintInner: { value: new THREE.Color('#d6d2ca') },
          uTintOuter: { value: new THREE.Color('#3e3a34') },
          uOpacity: { value: 0.42 },
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
      position={[0, 0.45, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
      frustumCulled={false}
    >
      <planeGeometry args={[32, 32, 48, 48]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  );
}
