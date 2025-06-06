import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

interface CoverageDetail {
  covered: number;
  pct: number;
  skipped: number;
  total: number;
}

interface FileCoverage {
  branches: CoverageDetail;
  branchesTrue: CoverageDetail;
  functions: CoverageDetail;
  lines: CoverageDetail;
  statements: CoverageDetail;
}

type Coverage = {
  total: FileCoverage;
} & {
  [file: string]: FileCoverage;
};

const currentFolder = process.cwd();
const readmePath = join(currentFolder, 'README.md');
const readme = readFileSync(readmePath, 'utf8');

const coveragePath = join(currentFolder, 'coverage', 'coverage-summary.json');
const coverageSummary = JSON.parse(readFileSync(coveragePath, 'utf8')) as Coverage;
const coverage = Math.round(coverageSummary.total.lines.pct);

let color: 'brightgreen' | 'green' | 'yellow' | 'yellowgreen' | 'orange' | 'red' | 'blue' | 'grey' | 'lightgrey';
if (coverage > 98) {
  color = 'brightgreen';
} else if (coverage > 95) {
  color = 'green';
} else if (coverage > 90) {
  color = 'yellow';
} else if (coverage > 80) {
  color = 'yellowgreen';
} else if (coverage > 50) {
  color = 'orange';
} else if (coverage >= 0) {
  color = 'red';
} else {
  color = 'grey';
}

const badgeRegex = /(!\[Coverage Badge\]\(https:\/\/img.shields.io\/badge\/coverage-)(\w+)(%25-)(\w+)(\?style=flat\))/;
const match = badgeRegex.exec(readme);
if (!match) {
  console.error('Badge image not found in the README.md file');
  process.exit(1);
} else {
  const newReadme = readme.replace(badgeRegex, `$1${coverage}$3${color}$5`);
  writeFileSync(readmePath, newReadme);
  console.log('README.md file successfully written');
}
