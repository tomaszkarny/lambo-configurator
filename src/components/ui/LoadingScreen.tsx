'use client';

import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const { progress, active } = useProgress();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-sm font-bold tracking-[0.3em] text-white/80 uppercase">
              Lamborghini
            </h2>
            <p className="text-[10px] tracking-[0.15em] text-white/50 uppercase">
              Terzo Millennio Configurator
            </p>

            {/* Progress bar */}
            <div
              className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mt-4"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Loading 3D model"
            >
              <motion.div
                className="h-full bg-[#ff6600] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            <p className="text-[11px] text-white/40 tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
