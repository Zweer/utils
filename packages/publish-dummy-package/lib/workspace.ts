import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { WorkspacePackage } from './types.js';

export function discoverWorkspacePackages(packagesDir: string): WorkspacePackage[] {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const pkgPath = join(packagesDir, entry.name);
      const pkgJsonPath = join(pkgPath, 'package.json');

      try {
        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as {
          name: string;
          version: string;
          private?: boolean;
        };

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
