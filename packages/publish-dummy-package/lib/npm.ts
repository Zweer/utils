import { execSync } from 'node:child_process';

export function checkNpmLogin(): string | null {
  try {
    return execSync('npm whoami', { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

export function ensureNpmLogin(): string {
  const username = checkNpmLogin();
  if (username) return username;

  console.log('🔑 Not logged in to npm. Starting login...\n');
  execSync('npm login', { stdio: 'inherit' });

  const newUsername = checkNpmLogin();
  if (!newUsername) {
    throw new Error('npm login failed. Please try again.');
  }
  return newUsername;
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
  const args = [`--access ${access}`, '--provenance false'];
  if (dryRun) args.push('--dry-run');

  try {
    execSync(`npm publish ${args.join(' ')}`, { cwd: pkgPath, stdio: 'pipe', encoding: 'utf-8' });
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message: string };
    const output = [err.stdout, err.stderr].filter(Boolean).join('\n');
    throw new Error(output || err.message);
  }
}
