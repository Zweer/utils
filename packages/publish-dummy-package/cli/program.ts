import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { Command } from '@commander-js/extra-typings';

import { ensureNpmLogin, publishDummyPackages } from '../lib/index.js';

interface Package {
  name: string;
  version: string;
  description: string;
}

export function buildProgram(): Command {
  const packageDetails = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8'),
  ) as Package;

  return new Command()
    .name(packageDetails.name.replace('@zweer/', ''))
    .description(packageDetails.description)
    .version(packageDetails.version)
    .option('--root-dir <PATH>', 'Root directory of the monorepo', join(cwd()))
    .option('--access <ACCESS>', 'npm publish access level', 'public')
    .option('--dry-run', 'Perform a dry run without publishing', false)
    .action((options) => {
      const { rootDir, access, dryRun } = options;

      const username = ensureNpmLogin();
      console.log(`✅ Logged in as: ${username}\n`);

      const results = publishDummyPackages({
        rootDir,
        access: access as 'public' | 'restricted',
        dryRun,
      });

      for (const result of results) {
        const icon =
          result.status === 'published' ? '📦' : result.status === 'skipped' ? '⏭️' : '❌';
        console.log(`${icon}  ${result.name}: ${result.reason}`);
      }

      console.log('\n✨ Done!');
    });
}
