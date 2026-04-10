'use client';

import { useConfigStore } from '@/store/useConfigStore';
import { cameraPresets } from '@/config/camera-presets';

export default function CameraPresets() {
  const currentPreset = useConfigStore((s) => s.cameraPreset);
  const setCameraPreset = useConfigStore((s) => s.setCameraPreset);

  return (
    <div>
      <p className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Camera</p>
      <div className="flex flex-wrap gap-1">
        {cameraPresets.map((preset) => {
          const isActive = currentPreset === preset.name;
          return (
            <button
              key={preset.name}
              onClick={() => setCameraPreset(preset.name)}
              className={`
                px-2.5 py-1 text-[10px] tracking-wider rounded-sm transition-all duration-200
                ${isActive
                  ? 'bg-[#ff6600]/20 text-[#ff6600] border border-[#ff6600]/30'
                  : 'text-white/55 hover:text-white/60 border border-transparent hover:border-white/10'
                }
              `}
              aria-pressed={isActive}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
