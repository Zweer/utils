import { execSync } from 'node:child_process';

export function checkNpmLogin(): string | null {
  try {
    return execSync('npm whoami', { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

export function packageExistsOnNpm(name: string): boolean {
  try {
    execSync(`npm view ${name} version`, { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function publishPackage(
  pkgPath: string,
  access: 'public' | 'restricted',
  dryRun: boolean,
): void {
  const args = [`--access ${access}`];
  if (dryRun) args.push('--dry-run');

  execSync(`npm publish ${args.join(' ')}`, { cwd: pkgPath, stdio: 'inherit' });
}
