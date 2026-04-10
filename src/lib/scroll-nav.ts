import { getLenis } from './lenis-instance';

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Scrolls to a normalized progress value (0-1) using the shared Lenis instance
 * when available, falling back to native smooth scrolling. Scrolling by target
 * progress — never by DOM id — avoids rounding issues at zone boundaries
 * (configurator/specs overlap caused color-overwrite bugs in the past).
 */
export function scrollToProgress(progress: number) {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(0, Math.min(1, progress));
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const target = clamped * maxScroll;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.8, easing: easeOutQuart });
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }
}
