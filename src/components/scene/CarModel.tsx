'use client';

import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigStore } from '@/store/useConfigStore';
import { getMeshGroup } from '@/lib/mesh-classifier';
import { materialPresets } from '@/config/materials';
import { interactivePartDefs, allInteractiveParts } from '@/config/interactive-parts';
import type { InteractivePart } from '@/types/configurator';
import { useFrame, useThree } from '@react-three/fiber';

const MODEL_PATH = '/models/lambo_clean.glb';

/** Find a part node by name prefix. Prefers group/Object3D over Mesh. */
function findPartNode(root: THREE.Object3D, namePrefix: string): THREE.Object3D | null {
  let groupMatch: THREE.Object3D | null = null;
  let meshMatch: THREE.Object3D | null = null;

  root.traverse((child) => {
    if (groupMatch) return;
    if (!child.name.startsWith(namePrefix)) return;
    if (!(child instanceof THREE.Mesh)) {
      groupMatch = child;
    } else if (!meshMatch) {
      meshMatch = child;
    }
  });

  return groupMatch || meshMatch;
}

export default function CarModel() {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, scene);
  const { invalidate } = useThree();

  // Store selectors
  const bodyColor = useConfigStore((s) => s.bodyColor);
  const bodyMaterial = useConfigStore((s) => s.bodyMaterial);
  const wheelColor = useConfigStore((s) => s.wheelColor);
  const wheelMaterial = useConfigStore((s) => s.wheelMaterial);
  const lightColor = useConfigStore((s) => s.lightColor);
  const lightIntensity = useConfigStore((s) => s.lightIntensity);
  const accentColor = useConfigStore((s) => s.accentColor);
  const windowTint = useConfigStore((s) => s.windowTint);
  const windowOpacity = useConfigStore((s) => s.windowOpacity);
  const wingsOpen = useConfigStore((s) => s.wingsOpen);
  const partStates = useConfigStore((s) => s.partStates);
  const explodeAmount = useConfigStore((s) => s.explodeAmount);

  // Shared materials - ONE material per group instead of one per mesh
  const materialsMap = useRef<Map<string, THREE.Material>>(new Map());
  const initialized = useRef(false);

  // Interactive parts refs
  const partNodesRef = useRef<Map<InteractivePart, THREE.Object3D>>(new Map());
  const partOriginalsRef = useRef<Map<InteractivePart, THREE.Vector3>>(new Map());
  const toggleProgressRef = useRef<Map<InteractivePart, number>>(new Map());
  const explodeProgressRef = useRef(0);
  const partStatesRef = useRef(partStates);
  const explodeAmountRef = useRef(explodeAmount);

  // Color refs for smooth lerp - start with current store values
  const colors = useRef({
    body: { current: new THREE.Color(bodyColor), target: new THREE.Color(bodyColor) },
    wheels: { current: new THREE.Color(wheelColor), target: new THREE.Color(wheelColor) },
    lights: { current: new THREE.Color(lightColor), target: new THREE.Color(lightColor) },
    accents: { current: new THREE.Color(accentColor), target: new THREE.Color(accentColor) },
    windows: { current: new THREE.Color(windowTint), target: new THREE.Color(windowTint) },
  });

  // Update targets when store changes
  useEffect(() => { colors.current.body.target.set(bodyColor); invalidate(); }, [bodyColor, invalidate]);
  useEffect(() => { colors.current.wheels.target.set(wheelColor); invalidate(); }, [wheelColor, invalidate]);
  useEffect(() => { colors.current.lights.target.set(lightColor); invalidate(); }, [lightColor, invalidate]);
  useEffect(() => {
    colors.current.accents.target.set(accentColor);
    invalidate();
  }, [accentColor, invalidate]);
  useEffect(() => { colors.current.windows.target.set(windowTint); invalidate(); }, [windowTint, invalidate]);

  // Update interactive part refs when store changes
  useEffect(() => { partStatesRef.current = partStates; invalidate(); }, [partStates, invalidate]);
  useEffect(() => { explodeAmountRef.current = explodeAmount; invalidate(); }, [explodeAmount, invalidate]);

  // Initial material setup - traverse once, create ONE shared material per group
  useEffect(() => {
    if (initialized.current) return;
    const store = useConfigStore.getState();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const map = new Map<string, THREE.Material>();

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat?.name) return;

      const group = getMeshGroup(mat.name);
      if (!group) return;

      // Create shared material only once per group
      if (!map.has(group)) {
        map.set(group, createMaterialForGroup(group, store, isMobile));
      }
      child.material = map.get(group)!;
    });

    materialsMap.current = map;
    initialized.current = true;

    // Hide custom paint overlay nodes (contain "63" racing number & text decals from original model)
    const decalNodes = [
      'chassis_carpaint_custom01_LOD2_46',
      'detach_trunk_50_carpaint_custom02_LOD2_82',
      'detach_wing_10_carpaint_custom03_LOD2_0',
      'chassis_carpaint_normal_LOD2_48',
    ];
    for (const name of decalNodes) {
      const node = scene.getObjectByName(name);
      if (node) node.visible = false;
    }

    // Hide small overlay meshes with Material.001 (gray text/number decals baked into model)
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat?.name === 'Material.001') {
        child.visible = false;
      }
    });

    // Hide Orange material meshes on skirts (contain baked "RIMUOVERE" text)
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat?.name === 'Orange') {
        let node: THREE.Object3D | null = child;
        while (node) {
          if (node.name.toLowerCase().includes('skirt')) {
            child.visible = false;
            break;
          }
          node = node.parent;
        }
      }
    });

    // Discover interactive part nodes
    const nodes = new Map<InteractivePart, THREE.Object3D>();
    const originals = new Map<InteractivePart, THREE.Vector3>();

    for (const id of allInteractiveParts) {
      const def = interactivePartDefs[id];
      const node = findPartNode(scene, def.nodeName);
      if (node) {
        nodes.set(id, node);
        originals.set(id, node.position.clone());
      }
    }

    partNodesRef.current = nodes;
    partOriginalsRef.current = originals;

    // Sync color refs to actual store values
    colors.current.body.current.set(store.bodyColor);
    colors.current.wheels.current.set(store.wheelColor);
    colors.current.lights.current.set(store.lightColor);
    colors.current.accents.current.set(store.accentColor);
    colors.current.windows.current.set(store.windowTint);

    invalidate();
  }, [scene, invalidate]);

  // Material preset changes (roughness/metalness/clearcoat)
  useEffect(() => {
    const mat = materialsMap.current.get('body');
    if (!mat) return;
    const preset = materialPresets[bodyMaterial];
    const m = mat as THREE.MeshPhysicalMaterial;
    m.roughness = preset.roughness;
    m.metalness = preset.metalness;
    m.clearcoat = preset.clearcoat;
    m.clearcoatRoughness = preset.clearcoatRoughness;
    m.needsUpdate = true;
    invalidate();
  }, [bodyMaterial, invalidate]);

  useEffect(() => {
    const mat = materialsMap.current.get('wheels');
    if (!mat) return;
    const preset = materialPresets[wheelMaterial];
    const m = mat as THREE.MeshPhysicalMaterial;
    m.roughness = preset.roughness;
    m.metalness = preset.metalness;
    m.clearcoat = preset.clearcoat;
    m.clearcoatRoughness = preset.clearcoatRoughness;
    m.needsUpdate = true;
    invalidate();
  }, [wheelMaterial, invalidate]);

  useEffect(() => {
    const mat = materialsMap.current.get('lights');
    if (!mat) return;
    (mat as THREE.MeshStandardMaterial).emissiveIntensity = lightIntensity;
    mat.needsUpdate = true;
    invalidate();
  }, [lightIntensity, invalidate]);

  useEffect(() => {
    const mat = materialsMap.current.get('windows');
    if (!mat) return;
    (mat as THREE.MeshPhysicalMaterial).opacity = windowOpacity;
    mat.needsUpdate = true;
    invalidate();
  }, [windowOpacity, invalidate]);

  // Wing animation
  useEffect(() => {
    const anim = actions?.['Animation'];
    if (!anim) return;

    anim.clampWhenFinished = true;
    anim.setLoop(THREE.LoopOnce, 1);

    if (wingsOpen) {
      anim.timeScale = 1;
      anim.reset().play();
    } else {
      if (anim.time > 0 || anim.isRunning()) {
        anim.timeScale = -1;
        anim.paused = false;
        if (!anim.isRunning()) {
          anim.time = anim.getClip().duration;
          anim.play();
        }
      }
    }
    invalidate();
  }, [wingsOpen, actions, invalidate]);

  // Smooth color interpolation + wing animation invalidation
  useFrame((state, delta) => {
    const t = 1 - Math.exp(-10 * delta);
    let needsRender = false;

    needsRender = lerpGroup('body', t, (mat, color) => {
      (mat as THREE.MeshPhysicalMaterial).color.copy(color);
    }) || needsRender;

    needsRender = lerpGroup('wheels', t, (mat, color) => {
      (mat as THREE.MeshPhysicalMaterial).color.copy(color);
    }) || needsRender;

    needsRender = lerpGroup('lights', t, (mat, color) => {
      const m = mat as THREE.MeshStandardMaterial;
      m.color.copy(color);
      m.emissive.copy(color);
    }) || needsRender;

    needsRender = lerpGroup('accents', t, (mat, color) => {
      const m = mat as THREE.MeshStandardMaterial;
      m.color.copy(color);
      m.emissive.copy(color);
    }) || needsRender;

    needsRender = lerpGroup('windows', t, (mat, color) => {
      (mat as THREE.MeshPhysicalMaterial).color.copy(color);
    }) || needsRender;

    // Keep invalidating while wing animation plays
    const anim = actions?.['Animation'];
    if (anim?.isRunning()) {
      needsRender = true;
    }

    // Interactive part transform animation
    const ps = partStatesRef.current;
    const ea = explodeAmountRef.current;

    // Lerp global explode progress
    let explodeP = explodeProgressRef.current;
    const explodeDelta = ea - explodeP;
    if (Math.abs(explodeDelta) > 0.001) {
      explodeP += explodeDelta * t;
      explodeProgressRef.current = explodeP;
      needsRender = true;
    } else if (explodeP !== ea) {
      explodeP = ea;
      explodeProgressRef.current = explodeP;
    }

    // Animate each discovered part
    for (const [id, node] of partNodesRef.current) {
      const def = interactivePartDefs[id];
      const orig = partOriginalsRef.current.get(id)!;

      // Lerp toggle progress toward 0 or 1
      const toggleTarget = ps[id] ? 1 : 0;
      let toggleP = toggleProgressRef.current.get(id) ?? 0;
      const toggleDelta = toggleTarget - toggleP;

      if (Math.abs(toggleDelta) > 0.001) {
        toggleP += toggleDelta * t;
        toggleProgressRef.current.set(id, toggleP);
        needsRender = true;
      } else if (toggleP !== toggleTarget) {
        toggleP = toggleTarget;
        toggleProgressRef.current.set(id, toggleP);
      }

      // Position = original + toggle offset + explode offset
      const dir = def.direction!;
      const dist = def.maxDistance!;
      const eDir = def.explodeDirection;
      const eDist = def.explodeDistance;

      node.position.set(
        orig.x + dir[0] * dist * toggleP + eDir[0] * eDist * explodeP,
        orig.y + dir[1] * dist * toggleP + eDir[1] * eDist * explodeP,
        orig.z + dir[2] * dist * toggleP + eDir[2] * eDist * explodeP,
      );
    }

    if (needsRender) {
      state.invalidate();
    }
  });

  function lerpGroup(
    group: string,
    t: number,
    apply: (mat: THREE.Material, color: THREE.Color) => void
  ): boolean {
    const c = colors.current[group as keyof typeof colors.current];
    if (!c || c.current.equals(c.target)) return false;

    c.current.lerp(c.target, t);
    const mat = materialsMap.current.get(group);
    if (mat) apply(mat, c.current);
    return true;
  }

  return (
    <group>
      <primitive object={scene} />
    </group>
  );
}

function createMaterialForGroup(
  group: string,
  store: ReturnType<typeof useConfigStore.getState>,
  isMobile: boolean
): THREE.Material {
  switch (group) {
    case 'body': {
      const preset = materialPresets[store.bodyMaterial];
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(store.bodyColor),
        roughness: preset.roughness,
        metalness: preset.metalness,
        clearcoat: preset.clearcoat,
        clearcoatRoughness: preset.clearcoatRoughness,
        envMapIntensity: 1.0,
      });
    }
    case 'wheels': {
      const preset = materialPresets[store.wheelMaterial];
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(store.wheelColor),
        roughness: preset.roughness,
        metalness: preset.metalness,
        clearcoat: preset.clearcoat,
        clearcoatRoughness: preset.clearcoatRoughness,
        envMapIntensity: 0.8,
      });
    }
    case 'lights':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(store.lightColor),
        emissive: new THREE.Color(store.lightColor),
        emissiveIntensity: store.lightIntensity,
        toneMapped: false,
      });
    case 'accents':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(store.accentColor),
        emissive: new THREE.Color(store.accentColor),
        emissiveIntensity: 2.0,
        toneMapped: false,
      });
    case 'windows':
      // Transmission requires extra render pass - use simple transparent on mobile
      if (isMobile) {
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(store.windowTint),
          transparent: true,
          opacity: store.windowOpacity,
          roughness: 0.0,
          metalness: 0.2,
        });
      }
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(store.windowTint),
        transparent: true,
        opacity: store.windowOpacity,
        roughness: 0.0,
        metalness: 0.1,
        transmission: 0.9,
        ior: 1.5,
        thickness: 0.1,
      });
    default:
      return new THREE.MeshStandardMaterial();
  }
}

useGLTF.preload(MODEL_PATH);
