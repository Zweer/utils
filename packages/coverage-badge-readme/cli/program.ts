import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { Command } from '@commander-js/extra-typings';

import { createBadge } from '../lib/badge.js';
import { extractCoverage } from '../lib/coverage.js';
import { modifyReadme } from '../lib/readme.js';
import type { CoverageMode } from '../lib/types.js';
import { CoverageMetric } from '../lib/types.js';

interface Package {
  name: string;
  version: string;
  description: string;
}

export function buildProgram(): Command {
  const packageDetails = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8'),
  ) as Package;

  return new Command()
    .name(packageDetails.name.replace('@zweer/', ''))
    .description(packageDetails.description)
    .version(packageDetails.version)
    .option('--readme-path <PATH>', 'The path of the README file', join(cwd(), 'README.md'))
    .option(
      '--coverage-path <PATH>',
      'The path of the coverage-summary.json file',
      join(cwd(), 'coverage', 'coverage-summary.json'),
    )
    .option(
      '--coverage-metric <METRIC>',
      'The coverage metric to use (lines, branches, functions, statements, branchesTrue, average, min)',
      CoverageMetric.LINES,
    )
    .action((options, _command) => {
      const { coveragePath, readmePath, coverageMetric } = options;
      const percentage = extractCoverage(coveragePath, coverageMetric as CoverageMode);
      const badge = createBadge(Math.round(percentage));
      modifyReadme(readmePath, badge);
    });
}
