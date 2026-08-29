export const colors = {
  brand: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },

  semantic: {
    success: {
      light: '#ECFDF5',
      main: '#059669',
      dark: '#047857',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#FFFBEB',
      main: '#D97706',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      light: '#FEF2F2',
      main: '#DC2626',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#EFF6FF',
      main: '#2563EB',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
  },

  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  surface: {
    level0: '#FFFFFF',
    level1: '#FAFAFA',
    level2: '#F5F5F5',
    level3: '#E5E5E5',
    level0Dark: '#0A0A0A',
    level1Dark: '#171717',
    level2Dark: '#262626',
    level3Dark: '#404040',
  },

  text: {
    primary: { light: '#0F172A', dark: '#F8FAFC' },
    secondary: { light: '#475569', dark: '#94A3B8' },
    tertiary: { light: '#94A3B8', dark: '#64748B' },
    inverse: { light: '#FFFFFF', dark: '#0F172A' },
    disabled: { light: '#CBD5E1', dark: '#475569' },
    link: { light: '#10B981', dark: '#4ADE80' },
  },

  border: {
    light: '#E5E5E5',
    dark: '#404040',
    focus: '#10B981',
    error: '#DC2626',
  },

  overlay: {
    light: 'rgba(15, 23, 42, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },

  status: {
    agendada: { bg: '#EFF6FF', text: '#1D4ED8', border: '#2563EB' },
    confirmada: { bg: '#ECFDF5', text: '#047857', border: '#059669' },
    realizada: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
    cancelada: { bg: '#FEF2F2', text: '#B91C1C', border: '#DC2626' },
    nao_compareceu: { bg: '#FFFBEB', text: '#B45309', border: '#D97706' },
    ativo: { bg: '#ECFDF5', text: '#047857' },
    manutencao: { bg: '#FFFBEB', text: '#B45309' },
    inativo: { bg: '#F5F5F5', text: '#737373' },
  },
} as const;

export type Colors = typeof colors;