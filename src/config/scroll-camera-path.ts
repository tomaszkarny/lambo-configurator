import * as THREE from 'three';

export interface CameraKeyframe {
  progress: number;
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Keyframe progress values aligned to section boundaries:
 *   hero: 0.000-0.222, intro: 0.222-0.333,
 *   design-aero: 0.333-0.444, design-lights: 0.444-0.556,
 *   design-wing: 0.556-0.667, color: 0.667-0.833,
 *   configurator: 0.833-0.944, specs: 0.944-0.975,
 *   specs-explode: 0.975-0.99, footer-collapse: 0.99-0.997, finale: 0.997-1.0
 *
 * Hero cinematic (0.0-0.22): descending-then-ascending spiral.
 * Camera starts high (bird's-eye establishing), drops to low-angle heroic
 * shot as it sweeps the right side, hugs the ground for rear reveal, then
 * rises back up along the left for pull-out. Y varies 0.6 ↔ 2.8 for dramatic
 * cinematic arc — like car commercials (Lexus, Porsche film opens).
 *
 * Finale keyframes (0.97-1.0) implement a dramatic cinematic push-in:
 * camera distance drops from ~7m to ~3.5m, low-angle three-quarter hero
 * shot so the car fills roughly 50% of the viewport width at progress 1.0.
 * FOV=35° math: distance = (carHalfWidth=2) / tan(17.5°) ≈ 3.55m.
 */
export const cameraKeyframes: CameraKeyframe[] = [
  // Cinematic descending-then-ascending spiral orbit.
  // Height arc: 2.8 (high establishing) → 0.6 (ultra-low heroic) → 2.5 (climbing pullback).
  // Target slightly raised on low shots (y=0.8) to create "looking up at car" feel.
  { progress: 0.000, position: [0, 1.9, 8.5], target: [0, 0.6, 0] },      // elevated establishing — less top-down so ground fog doesn't veil car
  { progress: 0.030, position: [2.2, 1.6, 7.8], target: [0, 0.7, 0] },    // descending sweep right
  { progress: 0.055, position: [4.3, 1.1, 5.8], target: [0, 0.75, 0] },   // front-right — descending to hero level
  { progress: 0.085, position: [5.2, 0.6, 1.8], target: [0, 0.85, 0] },   // right profile ULTRA-LOW heroic
  { progress: 0.115, position: [4.6, 0.6, -1.5], target: [0, 0.8, 0] },   // rear-right ultra-low
  { progress: 0.145, position: [1.8, 0.9, -4], target: [0, 0.65, 0] },    // rear low angle
  { progress: 0.170, position: [-2.3, 1.4, -3.2], target: [0, 0.55, 0] }, // rear-left climbing
  { progress: 0.195, position: [-3.8, 2.0, 0.8], target: [0, 0.5, 0] },   // left side, rising
  { progress: 0.210, position: [-1.5, 2.5, 4.8], target: [0, 0.5, 0] },   // pulling up and back
  { progress: 0.222, position: [4, 2, 6], target: [0, 0.5, 0] },
  { progress: 0.333, position: [0, 1.2, 5], target: [0, 0.5, 0] },
  { progress: 0.444, position: [6, 1.2, 0], target: [0, 0.5, 0] },
  { progress: 0.556, position: [2.5, 0.8, 3.5], target: [0.5, 0.4, 1.5] },
  // Intermediate smoothing — fills 0.556 → 0.667 gap (prevents camera snap through car)
  { progress: 0.610, position: [1.4, 1.0, 0.0], target: [0.25, 0.45, 0.8] },
  { progress: 0.667, position: [0, 1.5, -5], target: [0, 0.5, 0] },
  // Intermediate smoothing — fills 0.667 → 0.75 (prevents huge sweep across car nose)
  { progress: 0.705, position: [2.2, 1.65, -2.0], target: [0, 0.5, 0] },
  { progress: 0.750, position: [4.5, 1.8, 4.5], target: [0, 0.5, 0] },
  { progress: 0.833, position: [4, 2, 6], target: [0, 0.5, 0] },
  // Extended finale push-in (was 0.97→1.0, now 0.92→1.0 for softer arc)
  { progress: 0.920, position: [4.6, 2.2, 5.0], target: [0.0, 0.45, 0.0] },
  { progress: 0.944, position: [5.0, 2.5, 5.0], target: [0.0, 0.30, 0.0] },
  { progress: 0.970, position: [4.0, 1.6, 4.2], target: [0.0, 0.55, 0.0] },
  { progress: 0.990, position: [2.6, 1.0, 3.0], target: [0.0, 0.55, 0.0] },
  { progress: 1.000, position: [2.2, 0.85, 2.6], target: [0.1, 0.60, 0.0] },
];

let positionSpline: THREE.CatmullRomCurve3 | null = null;
let targetSpline: THREE.CatmullRomCurve3 | null = null;

function getSplines() {
  if (!positionSpline || !targetSpline) {
    const positionPoints = cameraKeyframes.map(
      (kf) => new THREE.Vector3(...kf.position)
    );
    const targetPoints = cameraKeyframes.map(
      (kf) => new THREE.Vector3(...kf.target)
    );

    positionSpline = new THREE.CatmullRomCurve3(
      positionPoints,
      false,
      'centripetal'
    );
    targetSpline = new THREE.CatmullRomCurve3(
      targetPoints,
      false,
      'centripetal'
    );
  }

  return { positionSpline, targetSpline };
}

/**
 * Maps a normalized scroll progress (0-1) to the spline parameter (0-1)
 * by finding which segment the progress falls in and interpolating
 * between the keyframe progress values.
 */
function progressToSplineT(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  const keyframes = cameraKeyframes;
  const segmentCount = keyframes.length - 1;

  // Find which segment we're in
  for (let i = 0; i < segmentCount; i++) {
    const start = keyframes[i].progress;
    const end = keyframes[i + 1].progress;

    if (clamped >= start && clamped <= end) {
      // Local interpolation within this segment
      const localT = (clamped - start) / (end - start);
      // Map to spline parameter space (each segment is 1/segmentCount of the spline)
      return (i + localT) / segmentCount;
    }
  }

  return clamped >= 1 ? 1 : 0;
}

const _resultPosition = new THREE.Vector3();
const _resultTarget = new THREE.Vector3();

export function interpolateCamera(progress: number): {
  position: THREE.Vector3;
  target: THREE.Vector3;
} {
  const { positionSpline: pSpline, targetSpline: tSpline } = getSplines();
  const t = progressToSplineT(progress);

  pSpline.getPoint(t, _resultPosition);
  tSpline.getPoint(t, _resultTarget);

  return { position: _resultPosition, target: _resultTarget };
}
