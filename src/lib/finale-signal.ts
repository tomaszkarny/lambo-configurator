/**
 * Module-level signal for the finale bloom ramp. Written by ScrollEffects
 * (inside useFrame, not during React render) and read by BloomDriver inside
 * PostProcessing — also inside useFrame. Using a module variable instead of
 * Zustand avoids per-frame React re-renders: both sides live in the R3F
 * frameloop so they can mutate/read freely.
 *
 * Range: 0 at progress 0.92, 1 at progress 1.0.
 */
let finaleBloomT = 0;

export function setFinaleBloomT(v: number) {
  finaleBloomT = v;
}

export function getFinaleBloomT() {
  return finaleBloomT;
}

let heroRevealBloomT = 0;

export function setHeroRevealBloomT(v: number) {
  heroRevealBloomT = v;
}

export function getHeroRevealBloomT() {
  return heroRevealBloomT;
}
