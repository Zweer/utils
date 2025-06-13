import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function checkBaseDir(baseDir: string): void {
  if (!existsSync(baseDir) || !statSync(baseDir).isDirectory()) {
    console.error('The base directory provided is not a real directory');
    throw new Error('InvalidBaseDir');
  }
}

export function readGitIgnore(baseDir: string): string[] {
  const gitIgnoreFilepath = join(baseDir, '.gitignore');
  if (!existsSync(gitIgnoreFilepath)) {
    console.warn('No .gitignore file found');
    throw new Error('GitIgnoreNotFound');
  }

  const gitIgnoreContent = readFileSync(gitIgnoreFilepath, 'utf8');

  return gitIgnoreContent.split('\n');
}
