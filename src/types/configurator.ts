export type PartGroup = 'body' | 'wheels' | 'lights' | 'accents' | 'windows';

export type MaterialType = 'glossy' | 'matte' | 'metallic' | 'satin' | 'carbon';

export type InteractivePart =
  | 'doorL' | 'doorR'
  | 'trunk'
  | 'skirtL' | 'skirtR'
  | 'lip' | 'diffuser'
  | 'wing'
  | 'glass'
  | 'wheelFL' | 'wheelFR' | 'wheelRL' | 'wheelRR'
  | 'chassis' | 'piston' | 'exhaust' | 'windshield';

export interface PartTransformDef {
  nodeName: string;
  type: 'rotate' | 'translate';
  axis?: [number, number, number];
  maxAngle?: number;
  direction?: [number, number, number];
  maxDistance?: number;
  explodeDirection: [number, number, number];
  explodeDistance: number;
  label: string;
}

export interface InteractiveGroup {
  label: string;
  parts: InteractivePart[];
}

export interface MaterialPreset {
  name: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  label: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface ConfigPreset {
  name: string;
  bodyColor: string;
  bodyMaterial: MaterialType;
  wheelColor: string;
  wheelMaterial: MaterialType;
  lightColor: string;
  lightIntensity: number;
  accentColor: string;
  windowTint: string;
  windowOpacity: number;
}

export interface ConfigState {
  activePart: PartGroup;
  bodyColor: string;
  bodyMaterial: MaterialType;
  wheelColor: string;
  wheelMaterial: MaterialType;
  lightColor: string;
  lightIntensity: number;
  accentColor: string;
  windowTint: string;
  windowOpacity: number;
  cameraPreset: string;
  autoRotate: boolean;
  wingsOpen: boolean;
  isMobile: boolean;
  partStates: Record<InteractivePart, boolean>;
  explodeAmount: number;
}

export interface ConfigActions {
  setActivePart: (part: PartGroup) => void;
  setBodyColor: (color: string) => void;
  setBodyMaterial: (material: MaterialType) => void;
  setWheelColor: (color: string) => void;
  setWheelMaterial: (material: MaterialType) => void;
  setLightColor: (color: string) => void;
  setLightIntensity: (intensity: number) => void;
  setAccentColor: (color: string) => void;
  setWindowTint: (tint: string) => void;
  setWindowOpacity: (opacity: number) => void;
  setCameraPreset: (preset: string) => void;
  setAutoRotate: (rotate: boolean) => void;
  setWingsOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  applyPreset: (preset: ConfigPreset) => void;
  resetToDefaults: () => void;
  togglePart: (part: InteractivePart) => void;
  setPartOpen: (part: InteractivePart, open: boolean) => void;
  setExplodeAmount: (amount: number) => void;
  resetInteractive: () => void;
  batchUpdate: (partial: Partial<ConfigState>) => void;
}

export type ConfigStore = ConfigState & ConfigActions;
