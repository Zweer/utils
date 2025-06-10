import type { Coverage } from './types.js';

import { existsSync, readFileSync } from 'node:fs';

import { CoverageMetric } from './types.js';

export function extractCoverage(filePath: string, coverageMetric: CoverageMetric): number {
  if (!Object.values(CoverageMetric).includes(coverageMetric)) {
    console.error(`"${coverageMetric}" has an invalid value. It must be one of the CoverageMetrics`);
    throw new Error('CoverageMetric');
  }

  if (!existsSync(filePath)) {
    console.error('No coverage file found at', filePath);
    throw new Error('FileNotFound');
  }

  const fileContent = readFileSync(filePath, 'utf8');
  let coverage: Coverage;

  try {
    coverage = JSON.parse(fileContent) as Coverage;
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    console.error('Invalid coverage file at', filePath, 'did you specify the "json-summary" reporter?');
    throw new Error('InvalidCoverageFile');
  }

  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!coverage || !coverage.total || !coverage.total[coverageMetric] || typeof coverage.total[coverageMetric].pct !== 'number') {
    console.error('Invalid coverage json file at', filePath, 'did you specify the "json-summary" reporter?');
    throw new Error('InvalidCoverageJsonFile');
  }

  const coveragePct = coverage.total[coverageMetric].pct;
  console.log('Coverage percentage found:', coveragePct);

  return coveragePct;
}
