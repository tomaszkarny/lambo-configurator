import type { CameraPreset } from '@/types/configurator';

export const cameraPresets: CameraPreset[] = [
  { name: 'Overview', position: [4, 2, 6], target: [0, 0.5, 0] },
  { name: 'Front', position: [0, 1.2, 5], target: [0, 0.5, 0] },
  { name: 'Rear', position: [0, 1.5, -5], target: [0, 0.5, 0] },
  { name: 'Side', position: [6, 1.2, 0], target: [0, 0.5, 0] },
  { name: 'Top', position: [0, 7, 0.5], target: [0, 0, 0] },
  { name: 'Wheel', position: [2.5, 0.5, 3], target: [1, 0.3, 0.8] },
  { name: 'Cockpit', position: [0.3, 1.1, -0.3], target: [0, 0.5, 1.0] },
  { name: 'Passenger', position: [-0.3, 1.1, -0.3], target: [0, 0.5, 1.0] },
  { name: 'Look Back', position: [0, 1.1, 0.3], target: [0, 0.5, -1.2] },
];
