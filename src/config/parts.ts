import type { PartGroup } from '@/types/configurator';

/**
 * Maps GLTF material names to configurable part groups.
 * Source: Model has 47 materials, we expose 5 groups to the user.
 */
export const materialToPartGroup: Record<string, PartGroup> = {
  // Body (17 meshes) - main car body panels
  'Carosserie': 'body',

  // Wheels (16 meshes) - rims
  'Jantes': 'wheels',
  'Jantes_I': 'wheels',

  // Lights (12 meshes) - emissive lights
  'Lumire_Orange': 'lights',
  'Lumire_rouge': 'lights',
  'Lumire_blanche': 'lights',

  // Accents (5 meshes) - emissive accent lines
  'Orange': 'accents',

  // Windows (2 meshes) - glass
  'Vitres': 'windows',
};

/** Materials that should never be modified */
export const immutableMaterials = new Set([
  'CARBONE',
  'Carbone',
  'Blanck',
  'Tire',
  'Tire.001',
  'material_0',
  'material',
  'Material',
  'Material.001',
  'Material.002',
  'Material.003',
  'Material.017',
  'Material.018',
  'Material.023',
  'Material.025',
  'Material.026',
  'Material.027',
  'Material.028',
  'Material.029',
  'Material.030',
  'Material.031',
  'Material.032',
  'Material.033',
  'Material.034',
  'Material.036',
  'Material.037',
  'Material.038',
  'Material.039',
  'Material.040',
  'Material.041',
  'Material.042',
  'Material.044',
  'Material.049',
  'Rouge',
  'Vert',
  'Blanc',
  'BASE',
  'Volant.003',
  'Fer.001',
]);

export const partLabels: Record<PartGroup, string> = {
  body: 'Body',
  wheels: 'Wheels',
  lights: 'Lights',
  accents: 'Accents',
  windows: 'Windows',
};

export const partIcons: Record<PartGroup, string> = {
  body: '🚗',
  wheels: '◎',
  lights: '💡',
  accents: '✦',
  windows: '◻',
};
