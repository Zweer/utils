import type { RetrieveFilenamesOptions } from './types.js';

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import ignore from 'ignore';

import { defaultIgnoreList } from './constants.js';
import { checkBaseDir, readGitIgnore } from './utils.js';

export function retrieveFilenames(options: Partial<RetrieveFilenamesOptions> = {}): string[] {
  const {
    baseDir = process.cwd(),
    ignoreList = defaultIgnoreList,
    useGitIgnore = true,
  } = options;

  checkBaseDir(baseDir);

  const ignoreFiles: string[] = [];
  if (useGitIgnore) {
    ignoreFiles.push(...readGitIgnore(baseDir));
  }

  ignoreFiles.push(...ignoreList);

  const files = readdirSync(baseDir, { recursive: true, encoding: 'utf8' });

  const files2export = ignore()
    .add(ignoreFiles)
    .filter(files)
    .filter(file => !statSync(file).isDirectory())
    .sort();

  return files2export.map(file => join(baseDir, file));
}
