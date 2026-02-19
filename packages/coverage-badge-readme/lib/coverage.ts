import { existsSync, readFileSync } from 'node:fs';

import type { Coverage, CoverageMode } from './types.js';
import { AGGREGATION_METRICS, CoverageAggregation, CoverageMetric } from './types.js';

const VALID_MODES = new Set<string>([
  ...Object.values(CoverageMetric),
  ...Object.values(CoverageAggregation),
]);

function parseCoverageFile(filePath: string): Coverage {
  if (!existsSync(filePath)) {
    console.error('No coverage file found at', filePath);
    throw new Error('FileNotFound');
  }

  const fileContent = readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(fileContent) as Coverage;
  } catch (_error) {
    console.error(
      'Invalid coverage file at',
      filePath,
      'did you specify the "json-summary" reporter?',
    );
    throw new Error('InvalidCoverageFile');
  }
}

function getMetricPct(coverage: Coverage, filePath: string, metric: CoverageMetric): number {
  if (
    !coverage ||
    !coverage.total ||
    !coverage.total[metric] ||
    typeof coverage.total[metric].pct !== 'number'
  ) {
    console.error(
      'Invalid coverage json file at',
      filePath,
      'did you specify the "json-summary" reporter?',
    );
    throw new Error('InvalidCoverageJsonFile');
  }

  return coverage.total[metric].pct;
}

export function extractCoverage(filePath: string, mode: CoverageMode): number {
  if (!VALID_MODES.has(mode)) {
    console.error(`"${mode}" has an invalid value. It must be one of the CoverageMetrics`);
    throw new Error('CoverageMetric');
  }

  const coverage = parseCoverageFile(filePath);

  let coveragePct: number;

  if (mode === CoverageAggregation.AVERAGE || mode === CoverageAggregation.MIN) {
    const values = AGGREGATION_METRICS.map((metric) => getMetricPct(coverage, filePath, metric));
    coveragePct =
      mode === CoverageAggregation.AVERAGE
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : Math.min(...values);
  } else {
    coveragePct = getMetricPct(coverage, filePath, mode);
  }

  console.log('Coverage percentage found:', coveragePct);

  return coveragePct;
}
