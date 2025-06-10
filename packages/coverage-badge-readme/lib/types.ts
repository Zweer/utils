interface CoverageDetail {
  covered: number;
  pct: number;
  skipped: number;
  total: number;
}

export enum CoverageMetric {
  BRANCHES = 'branches',
  BRANCHES_TRUE = 'branchesTrue',
  FUNCTIONS = 'functions',
  LINES = 'lines',
  STATEMENTS = 'statements',
}

type FileCoverage = Record<CoverageMetric, CoverageDetail>;

export type Coverage = {
  total: FileCoverage;
} & {
  [file: string]: FileCoverage;
};

export enum Color {
  BRIGHTGREEN = 'brightgreen',
  GREEN = 'green',
  YELLOW = 'yellow',
  YELLOWGREEN = 'yellowgreen',
  ORANGE = 'orange',
  RED = 'red',
  BLUE = 'blue',
  GREY = 'grey',
  LIGHTGREY = 'lightgrey',
}

export interface CoverageColor {
  color: string;
  min?: number;
}
