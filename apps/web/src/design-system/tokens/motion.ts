// Motion tokens for animations
export const motion = {
  // Duration
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  // Scale
  scale: {
    none: 1,
    hover: 1.02,
    press: 0.98,
    card: 1.01,
  },
} as const;

export type MotionToken = typeof motion;
