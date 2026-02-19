'use client';

import { useConfigStore } from '@/store/useConfigStore';
import { colorsByPart } from '@/config/colors';
import type { PartGroup } from '@/types/configurator';

function getColorForPart(part: PartGroup, store: ReturnType<typeof useConfigStore.getState>): string {
  switch (part) {
    case 'body': return store.bodyColor;
    case 'wheels': return store.wheelColor;
    case 'lights': return store.lightColor;
    case 'accents': return store.accentColor;
    case 'windows': return store.windowTint;
  }
}

function getSetterForPart(part: PartGroup) {
  switch (part) {
    case 'body': return useConfigStore.getState().setBodyColor;
    case 'wheels': return useConfigStore.getState().setWheelColor;
    case 'lights': return useConfigStore.getState().setLightColor;
    case 'accents': return useConfigStore.getState().setAccentColor;
    case 'windows': return useConfigStore.getState().setWindowTint;
  }
}

export default function ColorPicker() {
  const activePart = useConfigStore((s) => s.activePart);
  const bodyColor = useConfigStore((s) => s.bodyColor);
  const wheelColor = useConfigStore((s) => s.wheelColor);
  const lightColor = useConfigStore((s) => s.lightColor);
  const accentColor = useConfigStore((s) => s.accentColor);
  const windowTint = useConfigStore((s) => s.windowTint);

  const setBodyColor = useConfigStore((s) => s.setBodyColor);
  const setWheelColor = useConfigStore((s) => s.setWheelColor);
  const setLightColor = useConfigStore((s) => s.setLightColor);
  const setAccentColor = useConfigStore((s) => s.setAccentColor);
  const setWindowTint = useConfigStore((s) => s.setWindowTint);

  const colors = colorsByPart[activePart];
  const currentColor = (() => {
    switch (activePart) {
      case 'body': return bodyColor;
      case 'wheels': return wheelColor;
      case 'lights': return lightColor;
      case 'accents': return accentColor;
      case 'windows': return windowTint;
    }
  })();

  const setColor = (hex: string) => {
    switch (activePart) {
      case 'body': return setBodyColor(hex);
      case 'wheels': return setWheelColor(hex);
      // Lights and accents are linked - both are the neon glow system
      case 'lights':
        setLightColor(hex);
        setAccentColor(hex);
        return;
      case 'accents':
        setAccentColor(hex);
        setLightColor(hex);
        return;
      case 'windows': return setWindowTint(hex);
    }
  };

  return (
    <div>
      <p className="text-[10px] tracking-widest text-white/30 uppercase mb-3">Color</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((swatch) => {
          const isActive = currentColor.toLowerCase() === swatch.hex.toLowerCase();
          return (
            <button
              key={swatch.hex}
              onClick={() => setColor(swatch.hex)}
              className={`
                group relative w-8 h-8 rounded-full transition-all duration-200
                ${isActive ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#0a0a0a] scale-110' : 'hover:scale-105'}
              `}
              style={{ backgroundColor: swatch.hex }}
              aria-label={swatch.name}
              title={swatch.name}
            >
              {isActive && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke={isLightColor(swatch.hex) ? '#000' : '#fff'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
