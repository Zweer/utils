import { packageExistsOnNpm, publishPackage } from './npm.js';
import type { PublishOptions, PublishResult } from './types.js';
import { discoverWorkspacePackages, resolveWorkspaces } from './workspace.js';

export function publishDummyPackages(options: PublishOptions): PublishResult[] {
  const { rootDir, access, dryRun } = options;
  const packageDirs = resolveWorkspaces(rootDir);
  const packages = discoverWorkspacePackages(packageDirs);
  const results: PublishResult[] = [];

  for (const pkg of packages) {
    if (pkg.private) {
      results.push({ name: pkg.name, status: 'skipped', reason: 'private package' });
      continue;
    }

    if (packageExistsOnNpm(pkg.name)) {
      results.push({ name: pkg.name, status: 'skipped', reason: 'already exists on npm' });
      continue;
    }

    try {
      publishPackage(pkg.path, access, dryRun);
      results.push({
        name: pkg.name,
        status: 'published',
        reason: dryRun ? 'dry run' : 'published successfully',
      });
    } catch (error) {
      results.push({ name: pkg.name, status: 'failed', reason: (error as Error).message });
    }
  }

  return results;
}

export { checkNpmLogin, ensureNpmLogin, packageExistsOnNpm, publishPackage } from './npm.js';
export type { PublishOptions, PublishResult, WorkspacePackage } from './types.js';
export { discoverWorkspacePackages, resolveWorkspaces } from './workspace.js';
