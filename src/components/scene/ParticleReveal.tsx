'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/store/useScrollStore';
import { useConfigStore } from '@/store/useConfigStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { setHeroRevealBloomT } from '@/lib/finale-signal';

const START = 0.0;
const END = 0.17;
const EXIT_BUFFER = 0.02;

// Shell dims hugging car silhouette
const SHELL_X = 2.6;
const SHELL_Y = 0.95;
const SHELL_Z = 3.6;
const SHELL_CENTER_Y = 0.55;

interface LayerCfg {
  count: number;
  radiusMin: number;
  radiusMax: number;
  sizeBase: number;
  sizeVariance: number;
  alphaMax: number;
  driftSpeed: number;
  corePulse: number; // 0 or 1
}

const LAYERS_DESKTOP: LayerCfg[] = [
  // Background dust — soft atmospheric haze
  {
    count: 6000,
    radiusMin: 1.15,
    radiusMax: 1.35,
    sizeBase: 0.04,
    sizeVariance: 0.04,
    alphaMax: 0.18,
    driftSpeed: 0.15,
    corePulse: 0,
  },
  // Mid stream — primary outward flow
  {
    count: 4000,
    radiusMin: 0.92,
    radiusMax: 1.08,
    sizeBase: 0.08,
    sizeVariance: 0.06,
    alphaMax: 0.35,
    driftSpeed: 0.35,
    corePulse: 0,
  },
  // Foreground sparks — bright ephemeral hotspots
  {
    count: 1500,
    radiusMin: 0.85,
    radiusMax: 0.95,
    sizeBase: 0.14,
    sizeVariance: 0.1,
    alphaMax: 0.55,
    driftSpeed: 0.6,
    corePulse: 1,
  },
];

const LAYERS_MOBILE: LayerCfg[] = LAYERS_DESKTOP.map((l) => ({
  ...l,
  count: Math.round(l.count * 0.5),
}));

function sampleShellInRadius(
  min: number,
  max: number
): [number, number, number, number] {
  const phi = Math.random() * Math.PI * 2;
  const costheta = 2 * Math.random() - 1;
  const theta = Math.acos(costheta);
  const r = min + Math.random() * (max - min);
  const sinT = Math.sin(theta);
  return [
    r * sinT * Math.cos(phi) * SHELL_X,
    r * sinT * Math.sin(phi) * SHELL_Y + SHELL_CENTER_Y,
    r * Math.cos(theta) * SHELL_Z,
    Math.random(),
  ];
}

function buildLayerGeometry(cfg: LayerCfg): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(cfg.count * 3);
  const seeds = new Float32Array(cfg.count);
  const sizes = new Float32Array(cfg.count);

  for (let i = 0; i < cfg.count; i++) {
    const [x, y, z, s] = sampleShellInRadius(cfg.radiusMin, cfg.radiusMax);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    seeds[i] = s;
    const chunky = Math.random() < 0.08;
    const roll = Math.random();
    sizes[i] = chunky
      ? cfg.sizeBase + cfg.sizeVariance + roll * cfg.sizeVariance * 0.8
      : cfg.sizeBase + roll * cfg.sizeVariance;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(0, SHELL_CENTER_Y, 0),
    10
  );
  return geo;
}

const vertexShader = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uProgress;
  uniform float uProgressSmoothed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uDriftSpeed;
  uniform float uCorePulse;
  uniform float uAlphaMax;
  varying float vSeed;
  varying float vAlpha;
  varying float vHeat;
  varying vec2 vCenterUV;

  // Lightweight value-noise hash — fast on GPU, organic enough for drift
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
    ) * 2.0 - 1.0;
  }

  // Curl-approximate: 3 offset noise samples → tangential flow
  vec3 curlFlow(vec3 p, float t) {
    vec3 q = p * 0.45 + vec3(t, t * 0.73, t * 0.91);
    return vec3(
      vnoise(q),
      vnoise(q + vec3(17.1, 0.0, 0.0)),
      vnoise(q + vec3(0.0, 23.7, 0.0))
    );
  }

  void main() {
    vSeed = aSeed;

    // Staggered wake-up — particles come alive sequentially
    float waken = smoothstep(0.0, 0.12, uProgressSmoothed + aSeed * 0.08);

    // Curl-based organic drift
    float tFlow = uTime * uDriftSpeed;
    vec3 drift = curlFlow(position, tFlow) * (0.04 + aSeed * 0.04) * uDriftSpeed;

    // Outward dispersal — radial from car center, eases in
    vec3 outDir = normalize(position - vec3(0.0, ${SHELL_CENTER_Y.toFixed(2)}, 0.0));
    float eased = pow(uProgressSmoothed, 1.35);
    vec3 outward = outDir * eased * (0.4 + aSeed * 0.45) * (0.6 + uDriftSpeed);

    vec3 finalPos = position + drift * waken + outward;

    // Core pulse for foreground sparks (momentary brightness spike mid-reveal)
    float pulseWindow = smoothstep(0.25, 0.5, uProgressSmoothed)
                     * (1.0 - smoothstep(0.5, 0.75, uProgressSmoothed));
    vHeat = uCorePulse * pulseWindow * (0.7 + aSeed * 0.6);

    // Alpha envelope — staggered intro, graceful fade
    float seedOffset = aSeed * 0.35;
    float localT = clamp((uProgressSmoothed - seedOffset * 0.3)
      / max(1.0 - seedOffset * 0.3, 0.001), 0.0, 1.0);
    float intro = smoothstep(0.0, 0.15, uProgressSmoothed + aSeed * 0.08);
    float outro = 1.0 - smoothstep(0.55, 1.0, localT);
    vAlpha = intro * outro * uAlphaMax * (0.7 + aSeed * 0.5);

    vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
    float sizeBoost = 1.0 + vHeat * 0.4;
    gl_PointSize = aSize * sizeBoost * uPixelRatio * (300.0 / max(-mvPos.z, 0.1));
    gl_PointSize = clamp(gl_PointSize, 1.0, 90.0);

    // Screen-space coord for iridescent shift in fragment
    vec4 clipPos = projectionMatrix * mvPos;
    vCenterUV = (clipPos.xy / max(clipPos.w, 0.001)) * 0.5 + 0.5;

    gl_Position = clipPos;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColorHot;
  uniform vec3 uColorCool;
  uniform vec3 uColorCore;
  uniform float uEnableCA;
  uniform float uIridescence;
  varying float vSeed;
  varying float vAlpha;
  varying float vHeat;
  varying vec2 vCenterUV;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft gaussian-like falloff
    float soft = smoothstep(0.5, 0.0, dist);
    float falloff = pow(soft, 2.2);

    // Iridescent cyan↔magenta mix driven by per-particle seed + screen position
    // Gives holographic shift as camera orbits — same particle different hue per angle
    float phase = vSeed * 6.2831853 + (vCenterUV.x + vCenterUV.y) * 3.14159;
    float irid = (sin(phase) * 0.5 + 0.5) * uIridescence + (1.0 - uIridescence) * 0.5;
    vec3 baseColor = mix(uColorCool, uColorHot, irid);

    // Hot white core blends in during core pulse moments
    float core = smoothstep(0.14, 0.0, dist);
    vec3 color = mix(baseColor, uColorCore, core * vHeat * 0.8);

    // Conditional chromatic aberration — only on bright particles, desktop only
    // Cheap trick: shift R/B per screen distance, creates "energy lens" feel
    if (uEnableCA > 0.5 && vAlpha > 0.28) {
      float caStr = vAlpha * 0.12;
      color.r = mix(color.r, color.r * (1.0 + caStr), 0.35);
      color.b = mix(color.b, color.b * (1.0 + caStr * 0.7), 0.35);
    }

    // Hot core emissive boost (additive-bloom friendly)
    float emBoost = 1.0 + vHeat * 0.9;

    float alpha = falloff * vAlpha;
    gl_FragColor = vec4(color * emBoost, alpha);
  }
`;

function makeMaterial(cfg: LayerCfg, enableCA: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uProgressSmoothed: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: {
        value: Math.min(window.devicePixelRatio || 1, enableCA ? 1.5 : 1),
      },
      uDriftSpeed: { value: cfg.driftSpeed },
      uCorePulse: { value: cfg.corePulse },
      uAlphaMax: { value: cfg.alphaMax },
      uEnableCA: { value: enableCA ? 1 : 0 },
      uIridescence: { value: 1.0 },
      uColorHot: { value: new THREE.Color('#ff2dd6') }, // hot magenta
      uColorCool: { value: new THREE.Color('#00e8ff') }, // neon cyan
      uColorCore: { value: new THREE.Color('#ffffff') },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
}

export default function ParticleReveal() {
  const reduced = useReducedMotion();
  const isMobile = useConfigStore((s) => s.isMobile);
  const groupRef = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const progressSmooth = useRef(0);

  const layers = useMemo(() => {
    const cfgs = isMobile ? LAYERS_MOBILE : LAYERS_DESKTOP;
    return cfgs.map((cfg) => ({
      cfg,
      geometry: buildLayerGeometry(cfg),
      material: makeMaterial(cfg, !isMobile),
    }));
  }, [isMobile]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (reduced) {
      group.visible = false;
      setHeroRevealBloomT(0);
      return;
    }

    clock.current += delta;
    const p = useScrollStore.getState().scrollProgress;
    const active = p < END + EXIT_BUFFER;
    group.visible = active;

    if (!active) {
      setHeroRevealBloomT(0);
      return;
    }

    const raw = (p - START) / (END - START);
    const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;

    // Exponential damping on progress — smoother than raw scroll scrub
    const alpha = 1 - Math.exp(-12 * delta);
    progressSmooth.current += (t - progressSmooth.current) * alpha;

    // Peak bloom surge in middle of reveal (sin curve, max 0.6 — subtle)
    const peakCurve = Math.sin(progressSmooth.current * Math.PI) * 0.6;
    setHeroRevealBloomT(peakCurve);

    for (const { material } of layers) {
      material.uniforms.uProgress.value = t;
      material.uniforms.uProgressSmoothed.value = progressSmooth.current;
      material.uniforms.uTime.value = clock.current;
    }
  });

  return (
    <group ref={groupRef} renderOrder={2}>
      {layers.map((layer, i) => (
        <points
          key={i}
          geometry={layer.geometry}
          material={layer.material}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
