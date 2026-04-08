import * as THREE from 'three';

export interface CameraKeyframe {
  progress: number;
  position: [number, number, number];
  target: [number, number, number];
}

export const cameraKeyframes: CameraKeyframe[] = [
  { progress: 0.00, position: [8, 5, 12], target: [0, 0, 0] },
  { progress: 0.08, position: [5, 3, 8], target: [0, 0.5, 0] },
  { progress: 0.18, position: [4, 2, 6], target: [0, 0.5, 0] },
  { progress: 0.25, position: [0, 1.2, 5], target: [0, 0.5, 0] },
  { progress: 0.35, position: [6, 1.2, 0], target: [0, 0.5, 0] },
  { progress: 0.45, position: [2.5, 0.8, 3.5], target: [0.5, 0.4, 1.5] },
  { progress: 0.55, position: [0, 1.5, -5], target: [0, 0.5, 0] },
  { progress: 0.65, position: [4.5, 1.8, 4.5], target: [0, 0.5, 0] },
  { progress: 0.75, position: [4, 2, 6], target: [0, 0.5, 0] },
  { progress: 0.85, position: [5, 2.5, 5], target: [0, 0.3, 0] },
  { progress: 1.00, position: [3, 1.5, 5], target: [0, 0.5, 0] },
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
