import type { MockInstance } from 'vitest';

import type { CoverageColor } from '../../lib/types.js';

import { it } from 'vitest';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { createBadge } from '../../lib/badge.js';

describe('lib -> badge', () => {
  let consoleLogSpy: MockInstance<typeof console.log>;
  let consoleWarnSpy: MockInstance<typeof console.warn>;
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe.each([
    { percentage: 100, expectedColor: 'brightgreen', expectedColor1: 'red', expectedColor2: '#098' },
    { percentage: 99, expectedColor: 'brightgreen', expectedColor1: 'red', expectedColor2: '#098' },
    { percentage: 98, expectedColor: 'brightgreen', expectedColor1: 'red', expectedColor2: '#098' },
    { percentage: 96, expectedColor: 'green', expectedColor1: 'red', expectedColor2: '#095' },
    { percentage: 95, expectedColor: 'green', expectedColor1: 'red', expectedColor2: '#095' },
    { percentage: 91, expectedColor: 'yellowgreen', expectedColor1: 'red', expectedColor2: '#090' },
    { percentage: 90, expectedColor: 'yellowgreen', expectedColor1: 'red', expectedColor2: '#090' },
    { percentage: 81, expectedColor: 'yellow', expectedColor1: 'red', expectedColor2: '#080' },
    { percentage: 80, expectedColor: 'yellow', expectedColor1: 'red', expectedColor2: '#080' },
    { percentage: 51, expectedColor: 'orange', expectedColor1: 'red', expectedColor2: '#050' },
    { percentage: 50, expectedColor: 'orange', expectedColor1: 'red', expectedColor2: '#050' },
    { percentage: 25, expectedColor: 'red', expectedColor1: 'red', expectedColor2: '#000' },
    { percentage: 1, expectedColor: 'red', expectedColor1: 'red', expectedColor2: '#000' },
    { percentage: 0, expectedColor: 'red', expectedColor1: 'red', expectedColor2: '#000' },
    { percentage: -1, expectedColor: 'red', expectedColor1: 'red', expectedColor2: '#000' },
  ])('percentage: $percentage', ({ percentage, expectedColor, expectedColor1, expectedColor2 }) => {
    it('should use the default badge', () => {
      expect(createBadge(percentage)).toBe(`![Coverage Badge](https://img.shields.io/badge/coverage-${percentage}%25-${expectedColor}?style=flat)`);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should use a custom badge', () => {
      expect(createBadge(percentage, undefined, '{PERCENTAGE}-{COLOR}')).toBe(`${percentage}-${expectedColor}`);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    const constantCoverageColors: CoverageColor[] = [{ color: 'red' }];
    it('should use a constant coverage color (default template)', () => {
      expect(createBadge(percentage, constantCoverageColors))
        .toBe(`![Coverage Badge](https://img.shields.io/badge/coverage-${percentage}%25-${expectedColor1}?style=flat)`);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should use a constant coverage color (custom template)', () => {
      expect(createBadge(percentage, constantCoverageColors, '{PERCENTAGE}-{COLOR}')).toBe(`${percentage}-${expectedColor1}`);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    const customCoverageColors: CoverageColor[] = [
      { min: 98, color: '#098' },
      { min: 95, color: '#095' },
      { min: 90, color: '#090' },
      { min: 80, color: '#080' },
      { min: 50, color: '#050' },
      { color: '#000' },
    ]; ;
    it('should use a custom coverage color (default template)', () => {
      expect(createBadge(percentage, customCoverageColors))
        .toBe(`![Coverage Badge](https://img.shields.io/badge/coverage-${percentage}%25-${expectedColor2}?style=flat)`);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should use a custom coverage color (custom template)', () => {
      expect(createBadge(percentage, customCoverageColors, '{PERCENTAGE}-{COLOR}')).toBe(`${percentage}-${expectedColor2}`);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('should throw an error if no colors are provided', () => {
      expect(() => createBadge(0, [])).toThrow('NoColors');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('The colors array has no elements. Please provide something');
    });
  });

  describe('warnings', () => {
    const color = 'red';
    const percentage = 10;

    it.each([
      {
        template: '{COLOR}',
        expectedBadge: color,
        expectedWarning: ['Be aware: there is no percentagePlaceholder', '{PERCENTAGE}', 'in the badge template!'],
      },
      {
        template: '{PERCENTAGE}',
        expectedBadge: percentage.toString(),
        expectedWarning: ['Be aware: there is no colorPlaceholder', '{COLOR}', 'in the badge template!'],
      },
    ])('should warn if it contains only the $template placeholder', ({ template, expectedWarning, expectedBadge }) => {
      expect(createBadge(percentage, undefined, template)).toBe(expectedBadge);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(...expectedWarning);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
