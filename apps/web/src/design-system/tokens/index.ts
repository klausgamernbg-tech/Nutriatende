export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borders';
export { motion as motionTokens } from './motion';

export const tokens = {
  colors,
  typography,
  spacing,
  borders,
  elevation,
  motion,
} as const;

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borders, elevation, motion } from './borders';