import type { CoverageColor } from './types.js';

import {
  badgeColorPlaceholder,
  badgePercentagePlaceholder,
  defaultBadgeTemplate,
  defaultCoverageColors,
} from './constants.js';
import { escapeRegex } from './utils.js';

export function createBadge(
  percentage: number,
  colors: CoverageColor[] = defaultCoverageColors,
  badgeTemplate: string = defaultBadgeTemplate,
) {
  const percentageMatch = new RegExp(escapeRegex(badgePercentagePlaceholder)).exec(badgeTemplate);
  if (colors.length === 0) {
    console.error('The colors array has no elements. Please provide something');
    throw new Error('NoColors');
  }

  if (!percentageMatch) {
    console.warn('Be aware: there is no percentagePlaceholder', badgePercentagePlaceholder, 'in the badge template!');
  }

  const colorMatch = new RegExp(escapeRegex(badgeColorPlaceholder)).exec(badgeTemplate);
  if (!colorMatch) {
    console.warn('Be aware: there is no colorPlaceholder', badgeColorPlaceholder, 'in the badge template!');
  }

  const { color } = colors.find(threshold => percentage >= (threshold.min ?? -Infinity))!;

  return badgeTemplate
    .replace(badgePercentagePlaceholder, percentage.toString())
    .replace(badgeColorPlaceholder, color);
}
