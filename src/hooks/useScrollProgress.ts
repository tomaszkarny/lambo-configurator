'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '@/store/useScrollStore';

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress() {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        useScrollStore.getState().setScrollProgress(self.progress);

        // Section boundaries:
        // 0: Hero      (0.00 - 0.18)
        // 1: Intro     (0.18 - 0.25)
        // 2: Design    (0.25 - 0.50)
        // 3: Color     (0.50 - 0.60)
        // 4: Config    (0.60 - 0.75)
        // 5: Specs     (0.75 - 0.90)
        // 6: Footer    (0.90 - 1.00)
        const p = self.progress;
        let section = 0;
        if (p > 0.90) section = 6;
        else if (p > 0.75) section = 5;
        else if (p > 0.60) section = 4;
        else if (p > 0.50) section = 3;
        else if (p > 0.25) section = 2;
        else if (p > 0.18) section = 1;

        useScrollStore.getState().setActiveSection(section);
        useScrollStore.getState().setIsConfigurator(section === 4);
      },
    });

    return () => trigger.kill();
  }, []);
}
