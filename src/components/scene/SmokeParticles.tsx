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

const COUNT_DESKTOP = 210;
const COUNT_MOBILE = 95;
// Fraction of particles biased to the floor (heavy ground smoke) vs
// rising mid/high puffs. ~60% hugging the ground for a dense floor fog
// layer; mid + far tiers share the remaining 40%.
const GROUND_FRACTION = 0.6;
// Far-tier fraction of the *non-ground* particles — large, low-alpha,
// slow-drifting puffs far from camera that blur into the scene fog.
// Over half of the non-ground budget so the whole scene reads as foggy,
// not just the subject pocket.
const FAR_FRACTION = 0.55;

// Immersive pocket — puffs fill the whole volume between the camera and the
// car. POCKET_R_MIN near 0 means particles can drift right in front of the
// lens; POCKET_R_MAX extends past the car. POCKET_Z_SCALE stretches the
// pocket along the camera axis so the viewer is surrounded, not just the car.
const POCKET_R_MIN = 0.2;
const POCKET_R_MAX = 10.0;
const POCKET_X_SCALE = 1.3;
const POCKET_Z_SCALE = 2.2;
// Far-tier pocket — bigger radius, full vertical range. Large distant
// puffs dissolve into the scene fog, reading as "the whole scene is in fog".
// Now wraps 360° around the camera with generous Y range so mist surrounds
// the viewer on every axis, not just the backdrop.
const FAR_R_MIN = 6.0;
const FAR_R_MAX = 22.0;
const FAR_Y_MIN = -0.5;
const FAR_Y_MAX = 5.5;
// Ground-biased rise but vertical spread up to eye level for immersion.
const SPAWN_Y_MIN = -0.15;
const SPAWN_Y_SPREAD = 2.2;
const RISE_HEIGHT = 2.6;
const LIFETIME_MIN = 13.0;
const LIFETIME_MAX = 21.0;
const SIZE_BASE = 8.5;

const vertexShader = /* glsl */ `
  attribute float aSpawnTime;
  attribute float aLifetime;
  attribute float aSeed;
  attribute float aRiseScale;
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

    // Vertical rise — eased, organic. Per-particle rise scale lets the
    // ground tier stay hugging the floor while mid/far tiers climb normally.
    float rise = pow(age, 0.48) * ${RISE_HEIGHT.toFixed(2)} * aRiseScale;

    // Live, visible drift — stronger amplitude + circular swirl component
    // so the mist clearly churns around the subject instead of hanging still.
    float windPhase = aSeed * 6.2831853 + uTime * 0.18;
    float swirlPhase = aSeed * 9.42 + uTime * 0.11;
    float swirlRadius = 0.8 + aSeed * 0.6;
    vec3 wind = vec3(
      sin(windPhase) * 0.55 + cos(windPhase * 0.7) * 0.32 + cos(swirlPhase) * swirlRadius,
      sin(swirlPhase * 0.4 + aSeed * 3.0) * 0.22,
      cos(windPhase * 0.83) * 0.42 + sin(windPhase * 0.6) * 0.28 + sin(swirlPhase) * swirlRadius
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

// Scene-reactive palette anchors — the mist lerps BETWEEN these two
// cool neutrals (highlight + shadow) TOWARD the current scene lightColor.
// Picking non-white / non-black anchors keeps the mist readable as smoke
// even when the scene light is extreme (e.g. pure red or pure yellow).
const BASE_LIGHT_HEX = '#e6f0f4'; // almost-white cool
const BASE_DARK_HEX = '#08111a'; // deep cool dark
// How far each anchor lerps toward scene lightColor — inner pulls further
// (reads the tint clearly), outer stays mostly dark so smoke keeps depth.
const SCENE_MIX_INNER = 0.45;
const SCENE_MIX_OUTER = 0.15;
// Exponential damping stiffness for the tint lerp. k=3 ≈ 330ms response.
const TINT_DAMPING_K = 3.0;

export default function SmokeParticles() {
  const reduced = useReducedMotion();
  const isMobile = useConfigStore((s) => s.isMobile);
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const startTime = useRef<number | null>(null);

  // Scene-reactive tint machinery — current/target colors lerped in useFrame.
  const baseLight = useMemo(() => new THREE.Color(BASE_LIGHT_HEX), []);
  const baseDark = useMemo(() => new THREE.Color(BASE_DARK_HEX), []);
  const currentInner = useRef(new THREE.Color('#d8ecf0'));
  const currentOuter = useRef(new THREE.Color('#0a1620'));
  const targetInner = useRef(new THREE.Color());
  const targetOuter = useRef(new THREE.Color());
  const sceneLightColor = useRef(new THREE.Color());

  const COUNT = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const origins = new Float32Array(COUNT * 3);
    const spawnTimes = new Float32Array(COUNT);
    const lifetimes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const riseScales = new Float32Array(COUNT);

    const groundCount = Math.floor(COUNT * GROUND_FRACTION);
    const nonGround = COUNT - groundCount;
    const farCount = Math.floor(nonGround * FAR_FRACTION);
    const farStart = COUNT - farCount;

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Tri-modal spawn:
      //   • ground tier  — hugs the floor, dense fog-machine emission
      //   • rising tier  — eye-level drift between ground and camera
      //   • far tier     — large distant puffs that blend into scene fog
      //                    (this is what reads as "the whole scene is foggy")
      const isGround = i < groundCount;
      const isFar = i >= farStart;
      const theta = Math.random() * Math.PI * 2;

      if (isFar) {
        const r = FAR_R_MIN + Math.random() * (FAR_R_MAX - FAR_R_MIN);
        origins[i * 3] = r * Math.cos(theta) * POCKET_X_SCALE;
        origins[i * 3 + 1] = FAR_Y_MIN + Math.random() * (FAR_Y_MAX - FAR_Y_MIN);
        origins[i * 3 + 2] = r * Math.sin(theta) * POCKET_Z_SCALE;
      } else {
        const r = POCKET_R_MIN + Math.random() * (POCKET_R_MAX - POCKET_R_MIN);
        origins[i * 3] = r * Math.cos(theta) * POCKET_X_SCALE;
        origins[i * 3 + 1] = isGround
          ? -0.1 + Math.random() * 1.1     // ground tier: -0.1 - 1.0m (thick floor band)
          : 0.55 + Math.random() * 1.1;    // rising tier: 0.55 - 1.65m
        origins[i * 3 + 2] = r * Math.sin(theta) * POCKET_Z_SCALE;
      }

      spawnTimes[i] = Math.random() * LIFETIME_MAX;
      // Far & ground tiers live longer — slow, persistent atmospheric layer.
      lifetimes[i] = isGround || isFar
        ? LIFETIME_MIN + 4 + Math.random() * (LIFETIME_MAX - LIFETIME_MIN)
        : LIFETIME_MIN + Math.random() * (LIFETIME_MAX - LIFETIME_MIN);
      seeds[i] = Math.random();

      // Rise scale: ground puffs barely climb (keeps the heavy floor fog
      // layer stable), rising puffs climb fully, far puffs lift gently.
      riseScales[i] = isGround ? 0.25 : isFar ? 0.55 : 1.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOriginOffset', new THREE.BufferAttribute(origins, 3));
    geo.setAttribute('aSpawnTime', new THREE.BufferAttribute(spawnTimes, 1));
    geo.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aRiseScale', new THREE.BufferAttribute(riseScales, 1));

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
          // Initial values — scene-reactive lerp in useFrame overwrites
          // these every frame based on useConfigStore.lightColor, so pick
          // a neutral cool cyan so the first frame is already on-brand.
          uTintInner: { value: new THREE.Color('#d8ecf0') },
          uTintOuter: { value: new THREE.Color('#0a1620') },
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

  useFrame((state, delta) => {
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

    // Scene-reactive palette: read lightColor imperatively (no hook
    // selectors in useFrame — per CLAUDE.md gotcha), compute target
    // tints by lerping neutral anchors toward the scene light, then
    // exponentially damp current toward target for smooth transitions
    // across zone boundaries.
    const lightHex = useConfigStore.getState().lightColor;
    sceneLightColor.current.set(lightHex);

    targetInner.current
      .copy(baseLight)
      .lerp(sceneLightColor.current, SCENE_MIX_INNER);
    targetOuter.current
      .copy(baseDark)
      .lerp(sceneLightColor.current, SCENE_MIX_OUTER);

    const t = 1 - Math.exp(-TINT_DAMPING_K * delta);
    currentInner.current.lerp(targetInner.current, t);
    currentOuter.current.lerp(targetOuter.current, t);

    mat.uniforms.uTintInner.value.copy(currentInner.current);
    mat.uniforms.uTintOuter.value.copy(currentOuter.current);
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
