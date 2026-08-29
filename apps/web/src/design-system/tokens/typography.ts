export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", Consolas, monospace',
  },

  fontSize: {
    displayLarge: { size: 57, lineHeight: 64, weight: '400', letterSpacing: '-0.25%' },
    displayMedium: { size: 45, lineHeight: 52, weight: '400', letterSpacing: '0%' },
    displaySmall: { size: 36, lineHeight: 44, weight: '400', letterSpacing: '0%' },
    headlineLarge: { size: 32, lineHeight: 40, weight: '600', letterSpacing: '0%' },
    headlineMedium: { size: 28, lineHeight: 36, weight: '600', letterSpacing: '0%' },
    headlineSmall: { size: 24, lineHeight: 32, weight: '600', letterSpacing: '0%' },
    titleLarge: { size: 22, lineHeight: 28, weight: '600', letterSpacing: '0%' },
    titleMedium: { size: 16, lineHeight: 24, weight: '600', letterSpacing: '0.15%' },
    titleSmall: { size: 14, lineHeight: 20, weight: '600', letterSpacing: '0.1%' },
    bodyLarge: { size: 16, lineHeight: 24, weight: '400', letterSpacing: '0.15%' },
    bodyMedium: { size: 14, lineHeight: 20, weight: '400', letterSpacing: '0.25%' },
    bodySmall: { size: 12, lineHeight: 16, weight: '400', letterSpacing: '0.4%' },
    labelLarge: { size: 14, lineHeight: 20, weight: '600', letterSpacing: '0.1%' },
    labelMedium: { size: 12, lineHeight: 16, weight: '600', letterSpacing: '0.5%' },
    labelSmall: { size: 11, lineHeight: 16, weight: '600', letterSpacing: '0.5%' },
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export type Typography = typeof typography;