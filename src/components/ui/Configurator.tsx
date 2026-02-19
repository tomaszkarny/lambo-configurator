'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import ConfigPanel from './ConfigPanel';
import { useResponsive } from '@/hooks/useResponsive';
import { useConfigStore } from '@/store/useConfigStore';
import { deserializeConfig } from '@/lib/url-state';

const SceneCanvas = dynamic(() => import('@/components/scene/SceneCanvas'), {
  ssr: false,
});

export default function Configurator() {
  const { isMobile } = useResponsive();

  // Sync isMobile to store for 3D scene components
  useEffect(() => {
    useConfigStore.getState().setIsMobile(isMobile);
  }, [isMobile]);

  // Hydrate from URL params on mount
  useEffect(() => {
    const search = window.location.search;
    if (!search) return;
    const config = deserializeConfig(search);
    const store = useConfigStore.getState();
    if (config.bodyColor) store.setBodyColor(config.bodyColor);
    if (config.bodyMaterial) store.setBodyMaterial(config.bodyMaterial);
    if (config.wheelColor) store.setWheelColor(config.wheelColor);
    if (config.wheelMaterial) store.setWheelMaterial(config.wheelMaterial);
    if (config.lightColor) store.setLightColor(config.lightColor);
    if (config.lightIntensity) store.setLightIntensity(config.lightIntensity);
    if (config.accentColor) store.setAccentColor(config.accentColor);
    if (config.windowTint) store.setWindowTint(config.windowTint);
    if (config.windowOpacity) store.setWindowOpacity(config.windowOpacity);
    if (config.wingsOpen) store.setWingsOpen(config.wingsOpen);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]">
      <LoadingScreen />
      <Header />

      {/* 3D Viewport */}
      <div
        className={`absolute inset-0 ${isMobile ? 'pb-12' : 'pr-[280px]'}`}
      >
        <SceneCanvas />
      </div>

      {/* Config Panel */}
      <ConfigPanel isMobile={isMobile} />
    </div>
  );
}
