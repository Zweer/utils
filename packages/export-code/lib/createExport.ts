import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname } from 'node:path';

const defaultTemplate = `# EXPORT

## File structure

\`\`\`
{TREE}
\`\`\`

## File export

{FILES}
{FILENAME}

{CODE}
{NOTLAST}
---

{NOTLAST}
{FILES}`;

function getLanguageForExtension(extension: string): string {
  const langMap: Record<string, string> = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'jsx',
    '.tsx': 'tsx',
    '.json': 'json',
    '.md': 'markdown',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'shell',
    '.py': 'python',
  };
  return langMap[extension.toLowerCase()] || '';
}

export function generateExportFile(
  filenames: string[],
  tree: string,
  exportPath: string,
  template: string = defaultTemplate,
): void {
  const fileLoopRegex = /\{FILES\}\n(.*?)\n\{FILES\}/s;
  const loopMatch = template.match(fileLoopRegex);

  if (!loopMatch || !loopMatch[1]) {
    console.error('Template doesn\'t contain {FILES} section');
    throw new Error('InvalidTemplate');
  }
  const fileTemplate = loopMatch[1];

  const notLastRegex = /\{NOTLAST\}(.*?)\{NOTLAST\}/s;
  const notLastMatch = fileTemplate.match(notLastRegex);
  const separatorTemplate = notLastMatch ? notLastMatch[1] : '';

  const allFilesContent = filenames.map((filename, index) => {
    const isLastFile = index === filenames.length - 1;

    const fileContent = readFileSync(filename, 'utf8');
    const extension = extname(filename);
    const language = getLanguageForExtension(extension);
    const codeBlock = `\`\`\`\`${language}\n${fileContent}\n\`\`\`\``;
    const currentFileBlock = fileTemplate
      .replace('{FILENAME}', filename)
      .replace('{CODE}', codeBlock)
      .replace(notLastRegex, isLastFile ? '' : separatorTemplate);

    return currentFileBlock;
  });

  const finalOutput = template
    .replace('{TREE}', tree)
    .replace(fileLoopRegex, allFilesContent.join(''));

  const exportDirectory = dirname(exportPath);
  mkdirSync(exportDirectory, { recursive: true });

  writeFileSync(exportPath, finalOutput);
}
