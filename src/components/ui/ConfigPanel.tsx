'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PartSelector from './PartSelector';
import ColorPicker from './ColorPicker';
import MaterialPicker from './MaterialPicker';
import CameraPresets from './CameraPresets';
import ShareButton from './ShareButton';
import InteractiveControls from './InteractiveControls';
import { useConfigStore } from '@/store/useConfigStore';
import { configPresets } from '@/config/defaults';

export default function ConfigPanel({ isMobile }: { isMobile: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const autoRotate = useConfigStore((s) => s.autoRotate);
  const setAutoRotate = useConfigStore((s) => s.setAutoRotate);
  const wingsOpen = useConfigStore((s) => s.wingsOpen);
  const setWingsOpen = useConfigStore((s) => s.setWingsOpen);
  const applyPreset = useConfigStore((s) => s.applyPreset);
  const activePart = useConfigStore((s) => s.activePart);
  const lightIntensity = useConfigStore((s) => s.lightIntensity);
  const setLightIntensity = useConfigStore((s) => s.setLightIntensity);
  const windowOpacity = useConfigStore((s) => s.windowOpacity);
  const setWindowOpacity = useConfigStore((s) => s.setWindowOpacity);

  const panelContent = (
    <div className="flex flex-col gap-5 p-5">
      {/* Part tabs */}
      <PartSelector />

      {/* Color swatches */}
      <ColorPicker />

      {/* Material picker (only for body/wheels) */}
      <MaterialPicker />

      {/* Intensity slider for lights */}
      {activePart === 'lights' && (
        <div>
          <p className="text-[10px] tracking-widest text-white/30 uppercase mb-2">
            Intensity: {lightIntensity.toFixed(1)}
          </p>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={lightIntensity}
            onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
            className="w-full accent-[#ff6600] h-1 bg-white/10 rounded-full"
            aria-label="Light intensity"
          />
        </div>
      )}

      {/* Opacity slider for windows */}
      {activePart === 'windows' && (
        <div>
          <p className="text-[10px] tracking-widest text-white/30 uppercase mb-2">
            Opacity: {Math.round(windowOpacity * 100)}%
          </p>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={windowOpacity}
            onChange={(e) => setWindowOpacity(parseFloat(e.target.value))}
            className="w-full accent-[#ff6600] h-1 bg-white/10 rounded-full"
            aria-label="Window opacity"
          />
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Camera presets */}
      <CameraPresets />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Toggles */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-[10px] tracking-widest text-white/30 uppercase">Auto Rotate</span>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`
              w-8 h-4 rounded-full transition-all duration-200 relative
              ${autoRotate ? 'bg-[#ff6600]/60' : 'bg-white/10'}
            `}
            role="switch"
            aria-checked={autoRotate}
          >
            <span className={`
              absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200
              ${autoRotate ? 'left-4' : 'left-0.5'}
            `} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-[10px] tracking-widest text-white/30 uppercase">Aero Wings</span>
          <button
            onClick={() => setWingsOpen(!wingsOpen)}
            className={`
              w-8 h-4 rounded-full transition-all duration-200 relative
              ${wingsOpen ? 'bg-[#ff6600]/60' : 'bg-white/10'}
            `}
            role="switch"
            aria-checked={wingsOpen}
          >
            <span className={`
              absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200
              ${wingsOpen ? 'left-4' : 'left-0.5'}
            `} />
          </button>
        </label>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Interactive Parts */}
      <InteractiveControls />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Presets */}
      <div>
        <p className="text-[10px] tracking-widest text-white/30 uppercase mb-3">Presets</p>
        <div className="grid grid-cols-2 gap-1.5">
          {configPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm
                border border-white/5 hover:border-white/15 transition-all duration-200 group"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/10"
                style={{ backgroundColor: preset.bodyColor }}
              />
              <span className="text-[10px] tracking-wider text-white/40 group-hover:text-white/60">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Share / Screenshot */}
      <ShareButton />
    </div>
  );

  // Mobile: bottom drawer
  if (isMobile) {
    return (
      <>
        {/* Drawer toggle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center
            py-3 bg-[#111]/90 backdrop-blur-md border-t border-white/5"
          aria-label="Toggle configuration panel"
        >
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </button>

        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto
                bg-[#111]/95 backdrop-blur-xl border-t border-white/5 rounded-t-2xl"
            >
              {/* Drag handle */}
              <div
                className="flex items-center justify-center py-3 cursor-pointer"
                onClick={() => setDrawerOpen(false)}
              >
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>
              {panelContent}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: sidebar
  return (
    <aside className="fixed top-0 right-0 bottom-0 z-40 w-[280px]
      bg-[#111]/80 backdrop-blur-xl border-l border-white/5
      overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
    >
      <div className="pt-16">
        {panelContent}
      </div>
    </aside>
  );
}
