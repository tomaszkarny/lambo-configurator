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
        >
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-sm font-bold tracking-[0.3em] text-white/80 uppercase">
              Lamborghini
            </h2>
            <p className="text-[10px] tracking-[0.15em] text-white/30 uppercase">
              Terzo Millennio Configurator
            </p>

            {/* Progress bar */}
            <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mt-4">
              <motion.div
                className="h-full bg-[#ff6600] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            <p className="text-[10px] text-white/20 tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
