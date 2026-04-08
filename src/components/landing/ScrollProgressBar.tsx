'use client';

import { motion } from 'framer-motion';
import { useScrollStore } from '@/store/useScrollStore';

export default function ScrollProgressBar() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <motion.div
        className="h-full w-full origin-left"
        style={{
          background:
            'linear-gradient(to right, #ff6600, rgba(255,102,0,0.6))',
          scaleX: scrollProgress,
        }}
        animate={{ opacity: scrollProgress > 0 ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      />
    </div>
  );
}
