'use client';

import { useConfigStore } from '@/store/useConfigStore';
import { materialPresets } from '@/config/materials';
import type { MaterialType } from '@/types/configurator';

const materialTypes: MaterialType[] = ['glossy', 'matte', 'metallic', 'satin', 'carbon'];

export default function MaterialPicker() {
  const activePart = useConfigStore((s) => s.activePart);
  const bodyMaterial = useConfigStore((s) => s.bodyMaterial);
  const wheelMaterial = useConfigStore((s) => s.wheelMaterial);
  const setBodyMaterial = useConfigStore((s) => s.setBodyMaterial);
  const setWheelMaterial = useConfigStore((s) => s.setWheelMaterial);

  // Materials only apply to body and wheels
  if (activePart !== 'body' && activePart !== 'wheels') return null;

  const currentMaterial = activePart === 'body' ? bodyMaterial : wheelMaterial;
  const setMaterial = activePart === 'body' ? setBodyMaterial : setWheelMaterial;

  return (
    <div>
      <p className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Material</p>
      <div className="grid grid-cols-5 gap-1.5">
        {materialTypes.map((type) => {
          const preset = materialPresets[type];
          const isActive = currentMaterial === type;
          return (
            <button
              key={type}
              onClick={() => setMaterial(type)}
              className={`
                flex flex-col items-center gap-1.5 px-2 py-2 rounded-md transition-all duration-200
                ${isActive
                  ? 'bg-white/10 border border-white/20'
                  : 'border border-transparent hover:bg-white/5'
                }
              `}
              aria-pressed={isActive}
              aria-label={`${preset.label} material`}
            >
              {/* Material preview sphere */}
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: getMaterialGradient(type),
                }}
              />
              <span className="text-[9px] tracking-wider text-white/50 uppercase">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getMaterialGradient(type: MaterialType): string {
  switch (type) {
    case 'glossy':
      return 'radial-gradient(circle at 30% 30%, #fff 0%, #888 30%, #333 70%, #111 100%)';
    case 'matte':
      return 'radial-gradient(circle at 40% 40%, #666 0%, #444 50%, #333 100%)';
    case 'metallic':
      return 'radial-gradient(circle at 30% 30%, #fff 0%, #aaa 20%, #666 50%, #333 100%)';
    case 'satin':
      return 'radial-gradient(circle at 35% 35%, #bbb 0%, #777 40%, #444 100%)';
    case 'carbon':
      return 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 4px 4px';
  }
}
