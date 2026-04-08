'use client';

import { create } from 'zustand';

interface ScrollState {
  scrollProgress: number;
  activeSection: number;
  isConfigurator: boolean;
  setScrollProgress: (p: number) => void;
  setActiveSection: (s: number) => void;
  setIsConfigurator: (v: boolean) => void;
}

export const useScrollStore = create<ScrollState>()((set) => ({
  scrollProgress: 0,
  activeSection: 0,
  isConfigurator: false,
  setScrollProgress: (p: number) => set({ scrollProgress: p }),
  setActiveSection: (s: number) => set({ activeSection: s }),
  setIsConfigurator: (v: boolean) => set({ isConfigurator: v }),
}));
