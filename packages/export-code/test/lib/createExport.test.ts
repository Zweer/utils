import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateExportFile } from '../../lib/createExport.js';

vi.mock('node:fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs;
});

describe('generateExportFile', () => {
  const MOCK_FILES_STRUCTURE = {
    '/project/src/index.ts': 'console.log("Hello, TypeScript!");',
    '/project/README.md': '# My Awesome Project',
    '/project/src/utils.js': 'const a = () => `hello ``` world`;',
  };
  const MOCK_FILENAMES = Object.keys(MOCK_FILES_STRUCTURE);
  const MOCK_TREE = `project
├── README.md
└── src
    ├── index.ts
    └── utils.js`;
  const EXPORT_PATH = '/project/export.md';

  beforeEach(() => {
    vol.fromJSON(MOCK_FILES_STRUCTURE, '/');
  });

  afterEach(() => {
    vol.reset();
  });

  it('should generate a file using the default template', () => {
    generateExportFile(MOCK_FILENAMES, MOCK_TREE, EXPORT_PATH);

    expect(vol.existsSync(EXPORT_PATH)).toBe(true);

    const output = vol.readFileSync(EXPORT_PATH, 'utf8') as string;

    expect(output).toMatchSnapshot();
  });

  it('should correctly apply a custom template', () => {
    const customTemplate = `MY CUSTOM EXPORT
Tree:
{TREE}

Files:
{FILES}
--- FILE: {FILENAME} ---
{CODE}
{NOTLAST}
*** SEPARATOR ***
{NOTLAST}
{FILES}
`;

    generateExportFile(MOCK_FILENAMES, MOCK_TREE, EXPORT_PATH, customTemplate);

    const output = vol.readFileSync(EXPORT_PATH, 'utf8') as string;

    expect(output).toContain('MY CUSTOM EXPORT');
    expect(output).toContain('*** SEPARATOR ***');
    expect(output).not.toContain('## File structure');

    expect(output).toMatchSnapshot();
  });

  it('should throw an error if the template is invalid (missing {FILES})', () => {
    const invalidTemplate = 'This template has no file section.';

    const action = () => generateExportFile([], MOCK_TREE, EXPORT_PATH, invalidTemplate);

    expect(action).toThrow('InvalidTemplate');
  });

  it('should not include the {NOTLAST} separator for the last file', () => {
    const template = `{FILES}{FILENAME}{NOTLAST}---{NOTLAST}{FILES}`;

    generateExportFile(MOCK_FILENAMES, MOCK_TREE, EXPORT_PATH, template);

    const output = vol.readFileSync(EXPORT_PATH, 'utf8') as string;

    const expectedOutput = MOCK_FILENAMES.join('---');

    expect(output).toBe(expectedOutput);
  });

  it('should handle an empty list of filenames gracefully', () => {
    generateExportFile([], MOCK_TREE, EXPORT_PATH);

    const output = vol.readFileSync(EXPORT_PATH, 'utf8') as string;

    expect(output).toContain(MOCK_TREE);
    expect(output).not.toContain('{FILENAME}');
    expect(output).not.toContain('{CODE}');

    expect(output).toMatchSnapshot();
  });

  it('should correctly handle a single file in the list (no separator)', () => {
    const singleFilename = ['/project/README.md'];
    generateExportFile(singleFilename, 'project\n└── README.md', EXPORT_PATH);

    const output = vol.readFileSync(EXPORT_PATH, 'utf8') as string;

    expect(output).not.toContain('\n---\n');
    expect(output).toContain('# My Awesome Project');
    expect(output).toMatchSnapshot();
  });

  it('should correctly create code blocks with language identifiers', () => {
    generateExportFile(MOCK_FILENAMES, MOCK_TREE, EXPORT_PATH);
    const output = vol.readFileSync(EXPORT_PATH, 'utf8') as string;

    expect(output).toContain('````typescript\nconsole.log("Hello, TypeScript!");');
    expect(output).toContain('````markdown\n# My Awesome Project');
    expect(output).toContain('````javascript\nconst a = () => `hello ``` world`;');
  });
});
