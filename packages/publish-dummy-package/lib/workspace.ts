import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { WorkspacePackage } from './types.js';

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  workspaces?: string[] | { packages: string[] };
}

export function resolveWorkspaces(rootDir: string): string[] {
  const pkgJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8')) as PackageJson;

  const patterns = Array.isArray(pkgJson.workspaces)
    ? pkgJson.workspaces
    : (pkgJson.workspaces?.packages ?? []);

  if (patterns.length === 0) {
    throw new Error('No workspaces found in package.json');
  }

  return patterns.flatMap((pattern) => {
    if (pattern.includes('*')) {
      const baseDir = join(rootDir, pattern.replace(/\/?\*.*$/, ''));
      try {
        return readdirSync(baseDir, { withFileTypes: true })
          .filter((e) => e.isDirectory())
          .map((e) => join(baseDir, e.name));
      } catch {
        return [];
      }
    }
    return [join(rootDir, pattern)];
  });
}

export function discoverWorkspacePackages(packageDirs: string[]): WorkspacePackage[] {
  return packageDirs.flatMap((pkgPath) => {
    try {
      const pkgJson = JSON.parse(
        readFileSync(join(pkgPath, 'package.json'), 'utf-8'),
      ) as PackageJson;

      return [
        {
          name: pkgJson.name,
          version: pkgJson.version,
          path: pkgPath,
          private: pkgJson.private === true,
        },
      ];
    } catch {
      return [];
    }
  });
}
