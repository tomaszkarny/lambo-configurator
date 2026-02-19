import type { MaterialPreset, MaterialType } from '@/types/configurator';

export const materialPresets: Record<MaterialType, MaterialPreset> = {
  glossy: {
    name: 'glossy',
    roughness: 0.08,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    label: 'Glossy',
  },
  matte: {
    name: 'matte',
    roughness: 0.7,
    metalness: 0.1,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    label: 'Matte',
  },
  metallic: {
    name: 'metallic',
    roughness: 0.15,
    metalness: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.05,
    label: 'Metallic',
  },
  satin: {
    name: 'satin',
    roughness: 0.35,
    metalness: 0.6,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    label: 'Satin',
  },
  carbon: {
    name: 'carbon',
    roughness: 0.3,
    metalness: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    label: 'Carbon',
  },
};
