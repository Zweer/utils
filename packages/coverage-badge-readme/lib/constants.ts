import type { CoverageColor } from './types.js';

import { Color } from './types.js';

export const defaultCoverageColors: CoverageColor[] = [
  { min: 98, color: Color.BRIGHTGREEN },
  { min: 95, color: Color.GREEN },
  { min: 90, color: Color.YELLOWGREEN },
  { min: 80, color: Color.YELLOW },
  { min: 50, color: Color.ORANGE },
  { color: Color.RED },
];

export const badgePercentagePlaceholder = '{PERCENTAGE}';
export const badgeColorPlaceholder = '{COLOR}';
export const defaultBadgeTemplate = `![Coverage Badge](https://img.shields.io/badge/coverage-${badgePercentagePlaceholder}%25-${badgeColorPlaceholder}?style=flat)`;
