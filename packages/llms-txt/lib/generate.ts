import type { LlmsTxtOptions } from './types.js';

export function generateLlmsTxt(options: LlmsTxtOptions): string {
  const { projectName, projectDescription, siteUrl, sections } = options;
  const lines: string[] = [`# ${projectName}`, '', `> ${projectDescription}`, ''];

  for (const section of sections) {
    if (section.name) {
      lines.push(`## ${section.name}`, '');
    }

    for (const page of section.pages) {
      const desc = page.description ? `: ${page.description}` : '';
      lines.push(`- [${page.title}](${siteUrl}${page.link})${desc}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function generateLlmsFullTxt(options: LlmsTxtOptions): string {
  const { projectName, projectDescription, sections } = options;
  const parts: string[] = [`# ${projectName}\n\n> ${projectDescription}\n`];

  for (const section of sections) {
    for (const page of section.pages) {
      if (page.content) {
        parts.push(`\n---\n\n${page.content}\n`);
      }
    }
  }

  return parts.join('\n');
}
