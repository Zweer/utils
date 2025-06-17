import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { Command } from '@commander-js/extra-typings';

import { generateExportFile } from '../lib/createExport.js';
import { createFileTree } from '../lib/createTree.js';
import { retrieveFilenames } from '../lib/retrieveFilenames.js';

interface Package {
  name: string;
  version: string;
  description: string;
}

export function buildProgram(): Command {
  const packageDetails = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8')) as Package;

  return new Command()
    .name(packageDetails.name.replace('@zweer/', ''))
    .description(packageDetails.description)
    .version(packageDetails.version)
    .option('--export-path <PATH>', 'The path of the EXPORT file', join(process.cwd(), 'docs', 'EXPORT.md'))
    .action((options, _command) => {
      const { exportPath } = options;

      const filenames = retrieveFilenames();
      const tree = createFileTree(filenames);
      generateExportFile(filenames, tree, exportPath);
    });
}
