export const borders = {
  width: {
    none: 0,
    thin: 1,
    normal: 2,
    thick: 3,
  },
  style: 'solid' as const,
};

export const elevation = {
  level0: { boxShadow: 'none' },
  level1: { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  level2: { boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)' },
  level3: { boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.06)' },
  level4: { boxShadow: '0 16px 24px -8px rgba(0, 0, 0, 0.16), 0 8px 16px -8px rgba(0, 0, 0, 0.08)' },
};

export const motion = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
    entrance: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  },
  micro: {
    buttonPress: { scale: 0.98, duration: 100 },
    cardPress: { scale: 0.99, duration: 100 },
    switchToggle: { duration: 200 },
    checkboxCheck: { duration: 150 },
    skeletonPulse: { duration: 1200 },
  },
} as const;

export type Borders = typeof borders;
export type Elevation = typeof elevation;
export type Motion = typeof motion;