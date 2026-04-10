'use client';

import { useConfigStore } from '@/store/useConfigStore';
import { partLabels } from '@/config/parts';
import type { PartGroup } from '@/types/configurator';

const parts: PartGroup[] = ['body', 'wheels', 'lights', 'accents', 'windows'];

export default function PartSelector() {
  const activePart = useConfigStore((s) => s.activePart);
  const setActivePart = useConfigStore((s) => s.setActivePart);

  return (
    <div className="flex gap-1">
      {parts.map((part) => (
        <button
          key={part}
          onClick={() => setActivePart(part)}
          className={`
            px-3 py-1.5 text-[11px] tracking-wider uppercase rounded-sm transition-all duration-200
            ${activePart === part
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/55 hover:text-white/60 border border-transparent'
            }
          `}
          aria-pressed={activePart === part}
          aria-label={`Select ${partLabels[part]} for customization`}
        >
          {partLabels[part]}
        </button>
      ))}
    </div>
  );
}
