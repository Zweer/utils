import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { Command } from '@commander-js/extra-typings';

import { generateLlmsFullTxt, generateLlmsTxt, readProjectMeta, scanPages } from '../lib/index.js';

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
    .option('--project-name <NAME>', 'Project name (default: from package.json name)')
    .option('--project-description <DESC>', 'Project description (default: from package.json)')
    .option('--site-url <URL>', 'Base URL of the site (default: GitHub Pages from repo URL)')
    .option('--docs-dir <PATH>', 'Path to the docs directory', join(cwd(), 'docs'))
    .option(
      '--out-dir <PATH>',
      'Output directory for generated files',
      join(cwd(), 'docs', 'public'),
    )
    .action((options) => {
      const meta = readProjectMeta(cwd());

      const projectName = options.projectName ?? meta.name;
      const projectDescription = options.projectDescription ?? meta.description;
      const siteUrl = options.siteUrl ?? meta.siteUrl;

      if (!projectName) {
        console.error(
          '❌ Could not determine project name. Use --project-name or set name in package.json.',
        );
        process.exit(1);
      }

      const sections = scanPages(options.docsDir);
      const llmsTxtOptions = { projectName, projectDescription, siteUrl, sections };

      writeFileSync(join(options.outDir, 'llms.txt'), generateLlmsTxt(llmsTxtOptions));
      console.log('✅ Generated: llms.txt');

      writeFileSync(join(options.outDir, 'llms-full.txt'), generateLlmsFullTxt(llmsTxtOptions));
      console.log('✅ Generated: llms-full.txt');
    });
}
