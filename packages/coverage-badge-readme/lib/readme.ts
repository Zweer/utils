import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { badgeColorPlaceholder, badgePercentagePlaceholder, defaultBadgeTemplate } from './constants.js';
import { escapeRegex } from './utils.js';

export function modifyReadme(
  filePath: string,
  badge: string,
  badgeTemplate: string = defaultBadgeTemplate,
): void {
  if (!existsSync(filePath)) {
    console.error('No readme file found at', filePath);
    throw new Error('FileNotFound');
  }

  const fileContent = readFileSync(filePath, 'utf8');
  const badgeRegex = new RegExp(escapeRegex(badgeTemplate)
    .replace(escapeRegex(badgeColorPlaceholder), '\\w+')
    .replace(escapeRegex(badgePercentagePlaceholder), '\\w+'));

  if (!badgeRegex.test(fileContent)) {
    console.warn('It looks like the readme file doesn\'t have any coverage badge. Did you initialize it?');
  }

  const newFileContent = fileContent.replace(badgeRegex, badge);

  writeFileSync(filePath, newFileContent);

  console.log('Badge added to the readme file');
}
