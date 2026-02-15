import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { Command } from '@commander-js/extra-typings';

import { generateLlmsFullTxt, generateLlmsTxt, scanPages } from '../lib/index.js';

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
    .requiredOption('--project-name <NAME>', 'Project name for the llms.txt header')
    .requiredOption('--project-description <DESC>', 'Project description')
    .requiredOption('--site-url <URL>', 'Base URL of the site (e.g., https://example.com)')
    .option('--docs-dir <PATH>', 'Path to the docs directory', join(cwd(), 'docs'))
    .option(
      '--out-dir <PATH>',
      'Output directory for generated files',
      join(cwd(), 'docs', 'public'),
    )
    .action((options) => {
      const { projectName, projectDescription, siteUrl, docsDir, outDir } = options;

      const sections = scanPages(docsDir);
      const llmsTxtOptions = { projectName, projectDescription, siteUrl, sections };

      writeFileSync(join(outDir, 'llms.txt'), generateLlmsTxt(llmsTxtOptions));
      console.log('✅ Generated: llms.txt');

      writeFileSync(join(outDir, 'llms-full.txt'), generateLlmsFullTxt(llmsTxtOptions));
      console.log('✅ Generated: llms-full.txt');
    });
}
