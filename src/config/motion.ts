/**
 * Motion design tokens — single source of truth for animation timing across
 * the landing page. Using these consts instead of ad-hoc numbers ensures
 * scroll-story rhythm stays choreographed, not random.
 *
 * Import in Framer Motion `transition` props:
 *   transition={{ duration: MOTION.REVEAL, ease: MOTION.EASE_PREMIUM }}
 */
export const MOTION = {
  /** Standard section reveal — 800ms cinematic entry */
  REVEAL: 0.8,
  /** Fast micro-interactions — button hover, focus ring */
  MICRO: 0.2,
  /** Medium transitions — drawer open/close, modal fade */
  STANDARD: 0.4,
  /** Slow atmospheric — dividers, backdrop washes */
  AMBIENT: 0.75,

  /** Stagger between child elements in a reveal group */
  STAGGER: 0.12,
  /** Fast stagger for tight groups (specs grid, color dots) */
  STAGGER_TIGHT: 0.08,

  /** Premium ease — decelerating cubic, Apple-like */
  EASE_PREMIUM: [0.25, 0.4, 0, 1] as const,
  /** Spring for organic motion (drawer, reveal) */
  SPRING_SOFT: { type: 'spring' as const, damping: 24, stiffness: 140 },
  SPRING_CRISP: { type: 'spring' as const, damping: 22, stiffness: 120 },
} as const;
