'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConfigStore, ConfigPreset, PartGroup, MaterialType, InteractivePart } from '@/types/configurator';
import { defaultConfig } from '@/config/defaults';
import { defaultPartStates } from '@/config/interactive-parts';

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      ...defaultConfig,

      setActivePart: (part: PartGroup) => set({ activePart: part }),
      setBodyColor: (color: string) => set({ bodyColor: color }),
      setBodyMaterial: (material: MaterialType) => set({ bodyMaterial: material }),
      setWheelColor: (color: string) => set({ wheelColor: color }),
      setWheelMaterial: (material: MaterialType) => set({ wheelMaterial: material }),
      setLightColor: (color: string) => set({ lightColor: color }),
      setLightIntensity: (intensity: number) => set({ lightIntensity: intensity }),
      setAccentColor: (color: string) => set({ accentColor: color }),
      setWindowTint: (tint: string) => set({ windowTint: tint }),
      setWindowOpacity: (opacity: number) => set({ windowOpacity: opacity }),
      setCameraPreset: (preset: string) => set({ cameraPreset: preset }),
      setAutoRotate: (rotate: boolean) => set({ autoRotate: rotate }),
      setWingsOpen: (open: boolean) => set({ wingsOpen: open }),
      setIsMobile: (isMobile: boolean) => set({ isMobile }),

      applyPreset: (preset: ConfigPreset) =>
        set({
          bodyColor: preset.bodyColor,
          bodyMaterial: preset.bodyMaterial,
          wheelColor: preset.wheelColor,
          wheelMaterial: preset.wheelMaterial,
          lightColor: preset.lightColor,
          lightIntensity: preset.lightIntensity,
          accentColor: preset.accentColor,
          windowTint: preset.windowTint,
          windowOpacity: preset.windowOpacity,
        }),

      resetToDefaults: () => set(defaultConfig),

      togglePart: (part: InteractivePart) =>
        set((state) => ({
          partStates: { ...state.partStates, [part]: !state.partStates[part] },
        })),

      setPartOpen: (part: InteractivePart, open: boolean) =>
        set((state) => ({
          partStates: { ...state.partStates, [part]: open },
        })),

      setExplodeAmount: (amount: number) => set({ explodeAmount: amount }),

      resetInteractive: () =>
        set({ partStates: { ...defaultPartStates }, explodeAmount: 0 }),
    }),
    {
      name: 'lambo-config',
      partialize: (state) => ({
        bodyColor: state.bodyColor,
        bodyMaterial: state.bodyMaterial,
        wheelColor: state.wheelColor,
        wheelMaterial: state.wheelMaterial,
        lightColor: state.lightColor,
        lightIntensity: state.lightIntensity,
        accentColor: state.accentColor,
        windowTint: state.windowTint,
        windowOpacity: state.windowOpacity,
        wingsOpen: state.wingsOpen,
      }),
    }
  )
);
