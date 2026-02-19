import type { PartGroup } from '@/types/configurator';
import { materialToPartGroup, immutableMaterials } from '@/config/parts';

export interface ClassifiedMesh {
  group: PartGroup | null;
  materialName: string;
  immutable: boolean;
}

export function classifyMesh(materialName: string): ClassifiedMesh {
  if (immutableMaterials.has(materialName)) {
    return { group: null, materialName, immutable: true };
  }

  const group = materialToPartGroup[materialName] ?? null;
  return { group, materialName, immutable: false };
}

export function getMeshGroup(materialName: string): PartGroup | null {
  if (immutableMaterials.has(materialName)) return null;
  return materialToPartGroup[materialName] ?? null;
}
