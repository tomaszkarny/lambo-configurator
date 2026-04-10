'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from '@/lib/gsap-setup';
import { useScrollStore } from '@/store/useScrollStore';

export function useScrollProgress() {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        useScrollStore.getState().setScrollProgress(self.progress);

        // Section boundaries (from landing-content.ts heights, 900vh scroll range):
        // 0: Hero      (0.000 - 0.222)
        // 1: Intro     (0.222 - 0.333)
        // 2: Design    (0.333 - 0.667)
        // 3: Color     (0.667 - 0.833)
        // 4: Config    (0.833 - 0.944)
        // 5: Specs     (0.944 - ~1.0)
        // 6: Footer    (~1.0)
        const p = self.progress;
        let section = 0;
        if (p > 0.97) section = 6;
        else if (p > 0.944) section = 5;
        else if (p > 0.833) section = 4;
        else if (p > 0.667) section = 3;
        else if (p > 0.333) section = 2;
        else if (p > 0.222) section = 1;

        useScrollStore.getState().setActiveSection(section);
        useScrollStore.getState().setIsConfigurator(section === 4);
      },
    });

    return () => trigger.kill();
  }, []);
}
