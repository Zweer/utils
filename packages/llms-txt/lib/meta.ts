import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ProjectMeta {
  name: string;
  description: string;
  siteUrl: string;
}

interface PackageJson {
  name?: string;
  description?: string;
  repository?: string | { url?: string };
}

const GITHUB_RE = /github\.com[/:]([^/]+)\/([^/.]+)/;

export function readProjectMeta(rootDir: string): ProjectMeta {
  const pkgJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8')) as PackageJson;

  const name = pkgJson.name?.replace(/^@[^/]+\//, '') ?? '';
  const description = pkgJson.description ?? '';

  const repoUrl =
    typeof pkgJson.repository === 'string' ? pkgJson.repository : (pkgJson.repository?.url ?? '');

  let siteUrl = '';
  const match = repoUrl.match(GITHUB_RE);
  if (match) {
    siteUrl = `https://${match[1].toLowerCase()}.github.io/${match[2]}`;
  }

  return { name, description, siteUrl };
}
