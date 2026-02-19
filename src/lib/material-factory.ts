import * as THREE from 'three';
import type { MaterialType } from '@/types/configurator';
import { materialPresets } from '@/config/materials';

export function createBodyMaterial(
  color: string,
  materialType: MaterialType
): THREE.MeshPhysicalMaterial {
  const preset = materialPresets[materialType];
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: preset.roughness,
    metalness: preset.metalness,
    clearcoat: preset.clearcoat,
    clearcoatRoughness: preset.clearcoatRoughness,
    envMapIntensity: 1.0,
  });
}

export function createWheelMaterial(
  color: string,
  materialType: MaterialType
): THREE.MeshPhysicalMaterial {
  const preset = materialPresets[materialType];
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: preset.roughness,
    metalness: preset.metalness,
    clearcoat: preset.clearcoat,
    clearcoatRoughness: preset.clearcoatRoughness,
    envMapIntensity: 0.8,
  });
}

export function createEmissiveMaterial(
  color: string,
  intensity: number
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    toneMapped: false,
  });
}

export function createAccentMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 2.0,
    toneMapped: false,
  });
}

export function createWindowMaterial(
  tint: string,
  opacity: number
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tint),
    transparent: true,
    opacity: opacity,
    roughness: 0.0,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5,
    thickness: 0.1,
    envMapIntensity: 0.5,
  });
}

export function updateMaterialColor(
  material: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial,
  color: string
): void {
  material.color.set(color);
  if ('emissive' in material && material.emissive) {
    material.emissive.set(color);
  }
  material.needsUpdate = true;
}

export function updateMaterialPreset(
  material: THREE.MeshPhysicalMaterial,
  materialType: MaterialType
): void {
  const preset = materialPresets[materialType];
  material.roughness = preset.roughness;
  material.metalness = preset.metalness;
  material.clearcoat = preset.clearcoat;
  material.clearcoatRoughness = preset.clearcoatRoughness;
  material.needsUpdate = true;
}
