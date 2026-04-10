'use client';

import { useConfigStore } from '@/store/useConfigStore';
import { interactiveGroups } from '@/config/interactive-parts';

export default function InteractiveControls() {
  const partStates = useConfigStore((s) => s.partStates);
  const setPartOpen = useConfigStore((s) => s.setPartOpen);
  const explodeAmount = useConfigStore((s) => s.explodeAmount);
  const setExplodeAmount = useConfigStore((s) => s.setExplodeAmount);
  const resetInteractive = useConfigStore((s) => s.resetInteractive);

  const hasAnyActive = Object.values(partStates).some(Boolean) || explodeAmount > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] tracking-widest text-white/50 uppercase">
        Interactive Parts
      </p>

      {/* Part group toggles */}
      <div className="flex flex-col gap-2">
        {interactiveGroups.map((group) => {
          const isOpen = group.parts.every((p) => partStates[p]);

          return (
            <label
              key={group.label}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="text-[10px] tracking-widest text-white/50 uppercase">
                {group.label}
              </span>
              <button
                onClick={() => {
                  const newState = !isOpen;
                  for (const part of group.parts) {
                    setPartOpen(part, newState);
                  }
                }}
                className={`
                  w-8 h-4 rounded-full transition-all duration-200 relative
                  ${isOpen ? 'bg-[#ff6600]/60' : 'bg-white/10'}
                `}
                role="switch"
                aria-checked={isOpen}
                aria-label={`Toggle ${group.label}`}
              >
                <span
                  className={`
                    absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200
                    ${isOpen ? 'left-4' : 'left-0.5'}
                  `}
                />
              </button>
            </label>
          );
        })}
      </div>

      {/* Explode slider */}
      <div>
        <p className="text-[10px] tracking-widest text-white/50 uppercase mb-2">
          Explode: {Math.round(explodeAmount * 100)}%
        </p>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explodeAmount}
          onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
          className="w-full accent-[#ff6600] h-1 bg-white/10 rounded-full"
          aria-label="Explode amount"
        />
      </div>

      {/* Reset button */}
      {hasAnyActive && (
        <button
          onClick={resetInteractive}
          className="text-[10px] tracking-widest text-white/50 uppercase
            hover:text-[#ff6600] transition-colors duration-200"
        >
          Reset All
        </button>
      )}
    </div>
  );
}
