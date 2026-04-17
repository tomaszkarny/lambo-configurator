'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useConfigStore } from '@/store/useConfigStore';

/**
 * Cinematic smoke — studio fog machine / dry-ice look.
 * Fewer, larger, slower-drifting puffs with noise-field alpha and warm
 * grayscale palette. Zero rim highlight (that read as underwater bubbles).
 * Domain-warped 5-octave fBM carves organic silhouettes inside each sprite.
 */

const COUNT_DESKTOP = 140;
const COUNT_MOBILE = 65;

// Immersive pocket — puffs fill the whole volume between the camera and the
// car. POCKET_R_MIN near 0 means particles can drift right in front of the
// lens; POCKET_R_MAX extends past the car. POCKET_Z_SCALE stretches the
// pocket along the camera axis so the viewer is surrounded, not just the car.
const POCKET_R_MIN = 0.2;
const POCKET_R_MAX = 10.0;
const POCKET_X_SCALE = 1.3;
const POCKET_Z_SCALE = 2.2;
// Ground-biased rise but vertical spread up to eye level for immersion.
const SPAWN_Y_MIN = -0.15;
const SPAWN_Y_SPREAD = 2.2;
const RISE_HEIGHT = 4.6;
const LIFETIME_MIN = 13.0;
const LIFETIME_MAX = 21.0;
const SIZE_BASE = 8.5;

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

    float rawAge = uTime - aSpawnTime;
    float age = mod(rawAge, aLifetime) / aLifetime;
    vAge = age;

    // Vertical rise — eased, organic
    float rise = pow(age, 0.48) * ${RISE_HEIGHT.toFixed(2)};

    // Slow horizontal drift — amplitude low so puffs don't flee the hero pocket
    float windPhase = aSeed * 6.2831853 + uTime * 0.08;
    vec3 wind = vec3(
      sin(windPhase) * 0.22 + cos(windPhase * 0.7) * 0.14,
      0.0,
      cos(windPhase * 0.83) * 0.18 + sin(windPhase * 0.6) * 0.12
    ) * age;

    vec3 pos = position + aOriginOffset + wind + vec3(0.0, rise, 0.0);

    // Symmetric envelope — longer plateau for cinematic dwell.
    // Peak alpha kept low (0.18-0.38) so puffs read as diffuse smoke,
    // not cotton-ball cumulus clouds.
    float fadeIn = smoothstep(0.0, 0.18, age);
    float fadeOut = 1.0 - smoothstep(0.62, 1.0, age);
    vAlpha = fadeIn * fadeOut * (0.32 + aSeed * 0.25);

    // Gas expansion — less extreme since base size is already large
    float sizeGrowth = mix(0.5, 1.35, pow(age, 0.65));
    float pointSize = ${SIZE_BASE.toFixed(2)} * sizeGrowth * uSizeScale * (0.85 + aSeed * 0.5);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = pointSize * uPixelRatio * (380.0 / max(-mvPos.z, 0.1));
    gl_PointSize = clamp(gl_PointSize, 80.0, 1800.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uTintInner;
  uniform vec3 uTintOuter;
  varying float vAge;
  varying float vAlpha;
  varying float vSeed;

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

  // 5-octave fBM for turbulent smoke structure
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = p * 2.07 + vec3(11.7, 7.1, 13.3);
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    // Domain warping — distort UV coords before sampling density.
    // This is what breaks the circle into organic puff silhouettes.
    vec2 warp = vec2(
      fbm(vec3(uv * 2.0, vSeed * 3.0 + uTime * 0.05)),
      fbm(vec3(uv * 2.0 + 12.0, vSeed * 3.0 + uTime * 0.05))
    ) - 0.5;
    uv += warp * 0.35;

    // Noise-field alpha — puffy cloud shape, not a circle
    vec3 noiseCoord = vec3(uv * 2.4, vSeed * 7.0 + uTime * 0.04 + vAge * 0.8);
    float density = fbm(noiseCoord);

    // Radial falloff — gentle, long gradient to give soft smoke edge
    float radial = 1.0 - smoothstep(0.05, 0.48, length(uv));

    // Wide smoothstep on density = soft transition instead of binary
    // popcorn-clump alpha. Cinematic smoke has diffuse edges everywhere.
    float alpha = smoothstep(0.28, 0.72, density) * radial;
    if (alpha < 0.005) discard;

    // Gentle internal variation — smoke should not look like cauliflower
    float internalNoise = fbm(noiseCoord * 1.7 + 5.0);
    alpha *= (0.45 + internalNoise * 0.4);

    // --- 3D volumetric shading (fake spherical normal from UV) ---
    // Treat each puff as a sphere so light falls across its "volume"
    // instead of every sprite being flat. This is the trick that makes
    // billboard smoke read as 3D in film CG.
    vec2 sUv = (gl_PointCoord - 0.5) * 2.0;
    float h = 1.0 - dot(sUv, sUv);
    vec3 puffNormal = vec3(sUv, sqrt(max(h, 0.0)));

    // Key light from above-behind (classic rim+fill film smoke setup)
    vec3 keyDir = normalize(vec3(0.25, 0.85, -0.4));
    float keyLight = clamp(dot(puffNormal, keyDir), 0.0, 1.0);
    // Fill light (ambient bounce from the floor)
    vec3 fillDir = normalize(vec3(-0.2, -0.6, 0.7));
    float fillLight = clamp(dot(puffNormal, fillDir), 0.0, 1.0) * 0.4;
    // Rim from behind — thin bright edge where light wraps the puff
    float rim = pow(1.0 - max(puffNormal.z, 0.0), 2.5) * 0.7;

    float shade = 0.25 + keyLight * 0.75 + fillLight + rim;

    // Warm grayscale mix modulated by the 3D shade
    vec3 col = mix(uTintOuter, uTintInner, smoothstep(0.1, 0.9, density));
    col *= shade;

    // Subtle age-based darkening — older smoke dissipates cooler
    float lifeBrightness = 1.0 - vAge * 0.22;
    col *= lifeBrightness;

    gl_FragColor = vec4(col, alpha * vAlpha);
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
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Ring spawn — wider ellipsoidal distribution around car
      const theta = Math.random() * Math.PI * 2;
      const r = POCKET_R_MIN + Math.random() * (POCKET_R_MAX - POCKET_R_MIN);
      origins[i * 3] = r * Math.cos(theta) * POCKET_X_SCALE;
      origins[i * 3 + 1] = SPAWN_Y_MIN + Math.random() * SPAWN_Y_SPREAD;
      origins[i * 3 + 2] = r * Math.sin(theta) * POCKET_Z_SCALE;

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

    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 16);
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
          uTintInner: { value: new THREE.Color('#8a867e') }, // muted warm mid-grey
          uTintOuter: { value: new THREE.Color('#141210') }, // warm near-black
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
      renderOrder={2}
    >
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}
