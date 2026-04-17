'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useConfigStore } from '@/store/useConfigStore';

/**
 * GPU smoke particle system — real smoke physics (spawn → rise → expand → fade).
 *
 * Each particle has a procedural lifecycle in vertex shader:
 *  - aSpawnTime / aLifetime control birth and death
 *  - Position = origin + windDrift + verticalRise*velocity (slows over age)
 *  - Size grows from 0.3 → 2.0 over lifetime (gas expansion)
 *  - Alpha triangle envelope: 0.15s fade-in, plateau, gradual fade-out
 *
 * Fragment shader paints organic smoke puffs with noise-distorted radial
 * falloff — looks like real photographic smoke, not flat circles.
 *
 * Particles auto-respawn when they die (modulo math on age) — endless flow
 * without per-frame buffer updates from CPU.
 */

const COUNT_DESKTOP = 320;
const COUNT_MOBILE = 140;

// Hero pocket — particles spawn in a ring around the car, leaving the center
// clear so the subject stays crisp. r ∈ [2.6, 5.6], ellipsoidal (X tighter, Z wider).
const POCKET_R_MIN = 2.6;
const POCKET_R_MAX = 5.6;
const POCKET_X_SCALE = 0.85;
const POCKET_Z_SCALE = 1.1;
const SPAWN_Y = 0.0;
const RISE_HEIGHT = 3.5;
const LIFETIME_MIN = 6.0;
const LIFETIME_MAX = 11.0;
const SIZE_BASE = 0.6;

const vertexShader = /* glsl */ `
  attribute float aSpawnTime;
  attribute float aLifetime;
  attribute float aSeed;
  attribute vec3 aOriginOffset;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  varying float vAge;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vSeed = aSeed;

    // Loop the lifecycle — when particle dies, respawn as if new
    float rawAge = uTime - aSpawnTime;
    float age = mod(rawAge, aLifetime) / aLifetime; // 0..1
    vAge = age;

    // Vertical rise — fast at first, decelerating (drag)
    float rise = pow(age, 0.55) * ${RISE_HEIGHT.toFixed(1)};

    // Horizontal wind drift — sways over time, increases with age
    float windPhase = aSeed * 6.2831853 + uTime * 0.18;
    vec3 wind = vec3(
      sin(windPhase) * 0.55 + cos(windPhase * 0.7) * 0.35,
      0.0,
      cos(windPhase * 0.83) * 0.45 + sin(windPhase * 0.6) * 0.3
    ) * age;

    vec3 pos = position + aOriginOffset + wind + vec3(0.0, rise, 0.0);

    // Alpha envelope: fade in (0..0.12), plateau (0.12..0.55), fade out (0.55..1)
    float fadeIn = smoothstep(0.0, 0.12, age);
    float fadeOut = 1.0 - smoothstep(0.55, 1.0, age);
    vAlpha = fadeIn * fadeOut * (0.7 + aSeed * 0.4);

    // Size grows over lifetime — gas expansion
    float sizeGrowth = mix(0.35, 1.7, pow(age, 0.7));
    float pointSize = ${SIZE_BASE.toFixed(2)} * sizeGrowth * uSizeScale * (0.85 + aSeed * 0.5);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = pointSize * uPixelRatio * (380.0 / max(-mvPos.z, 0.1));
    gl_PointSize = clamp(gl_PointSize, 4.0, 260.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uTintInner;
  uniform vec3 uTintOuter;
  uniform vec3 uRimColor;
  varying float vAge;
  varying float vAlpha;
  varying float vSeed;

  // Lightweight 3D value noise
  float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.,0.,0.)), u.x),
          mix(hash(i + vec3(0.,1.,0.)), hash(i + vec3(1.,1.,0.)), u.x), u.y),
      mix(mix(hash(i + vec3(0.,0.,1.)), hash(i + vec3(1.,0.,1.)), u.x),
          mix(hash(i + vec3(0.,1.,1.)), hash(i + vec3(1.,1.,1.)), u.x), u.y),
      u.z
    );
  }

  // Multi-octave noise — gives smoke its turbulent texture
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = p * 2.13 + vec3(11.7, 7.1, 13.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    // Noise-distorted distance — breaks the perfect circle, makes it look organic
    vec3 noiseCoord = vec3(uv * 4.5, vSeed * 7.0 + uTime * 0.08 + vAge * 1.5);
    float distort = fbm(noiseCoord) * 0.18 - 0.09;
    float dist = length(uv) + distort;
    if (dist > 0.5) discard;

    // Soft falloff — gaussian-like, no hard edge
    float soft = smoothstep(0.5, 0.05, dist);
    float density = pow(soft, 1.6);

    // Internal turbulence detail — gives the puff varying density inside
    float internalNoise = fbm(noiseCoord * 1.7);
    density *= (0.55 + internalNoise * 0.65);

    // Color: deep blue-grey core, slightly brighter rim catches scene light
    vec3 col = mix(uTintOuter, uTintInner, density);

    // Rim accent — edges of puff catch scene cyan light, mimics subsurface
    float rim = smoothstep(0.18, 0.45, dist) * (1.0 - smoothstep(0.45, 0.5, dist));
    col += uRimColor * rim * 0.4;

    // Lifetime brightness curve — newer particles slightly hotter
    float lifeBrightness = 1.0 - vAge * 0.3;
    col *= lifeBrightness;

    float alpha = density * vAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function SmokeParticles() {
  const reduced = useReducedMotion();
  const isMobile = useConfigStore((s) => s.isMobile);
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const startTime = useRef<number | null>(null);

  const COUNT = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const origins = new Float32Array(COUNT * 3);
    const spawnTimes = new Float32Array(COUNT);
    const lifetimes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Static base position is origin — vertex shader handles motion
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Ring spawn — ellipsoidal distribution around car, hero pocket stays clear
      const theta = Math.random() * Math.PI * 2;
      const r = POCKET_R_MIN + Math.random() * (POCKET_R_MAX - POCKET_R_MIN);
      origins[i * 3] = r * Math.cos(theta) * POCKET_X_SCALE;
      origins[i * 3 + 1] = SPAWN_Y + Math.random() * 0.3;
      origins[i * 3 + 2] = r * Math.sin(theta) * POCKET_Z_SCALE;

      // Stagger spawn times so particles aren't all in sync
      spawnTimes[i] = Math.random() * LIFETIME_MAX;
      lifetimes[i] =
        LIFETIME_MIN + Math.random() * (LIFETIME_MAX - LIFETIME_MIN);
      seeds[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOriginOffset', new THREE.BufferAttribute(origins, 3));
    geo.setAttribute('aSpawnTime', new THREE.BufferAttribute(spawnTimes, 1));
    geo.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 14);
    return geo;
  }, [COUNT]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: {
            value: Math.min(window.devicePixelRatio || 1, 1.5),
          },
          uSizeScale: { value: 1.0 },
          uTintInner: { value: new THREE.Color('#0c2935') },
          uTintOuter: { value: new THREE.Color('#03101a') },
          uRimColor: { value: new THREE.Color('#3aa8c8') },
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
    const pts = pointsRef.current;
    const mat = matRef.current;
    if (!pts || !mat) return;

    if (reduced) {
      pts.visible = false;
      return;
    }
    pts.visible = true;

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      frustumCulled={false}
      renderOrder={1}
    >
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}
