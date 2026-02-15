import { describe, expect, it } from 'vitest';

import { generateLlmsFullTxt, generateLlmsTxt } from '../../lib/generate.js';
import type { LlmsTxtOptions } from '../../lib/types.js';

const baseOptions: LlmsTxtOptions = {
  projectName: 'My Project',
  projectDescription: 'A cool project',
  siteUrl: 'https://example.com',
  sections: [
    {
      name: '',
      pages: [
        { title: 'Home', link: '/', description: 'Welcome page', content: '# Home\nWelcome.' },
      ],
    },
    {
      name: 'Guide',
      pages: [
        {
          title: 'Getting Started',
          link: '/guide/getting-started',
          description: 'Quick start guide',
          content: '# Getting Started\nStep 1.',
        },
        {
          title: 'Config',
          link: '/guide/config',
          description: '',
          content: '# Config\nOptions.',
        },
      ],
    },
  ],
};

describe('lib -> generate', () => {
  describe('generateLlmsTxt', () => {
    it('should generate correct llms.txt format', () => {
      const result = generateLlmsTxt(baseOptions);

      expect(result).toBe(
        [
          '# My Project',
          '',
          '> A cool project',
          '',
          '- [Home](https://example.com/): Welcome page',
          '',
          '## Guide',
          '',
          '- [Getting Started](https://example.com/guide/getting-started): Quick start guide',
          '- [Config](https://example.com/guide/config)',
          '',
        ].join('\n'),
      );
    });

    it('should omit description suffix when description is empty', () => {
      const result = generateLlmsTxt(baseOptions);

      expect(result).toContain('- [Config](https://example.com/guide/config)\n');
      expect(result).not.toContain('- [Config](https://example.com/guide/config):');
    });

    it('should handle empty sections', () => {
      const result = generateLlmsTxt({
        ...baseOptions,
        sections: [],
      });

      expect(result).toBe('# My Project\n\n> A cool project\n');
    });
  });

  describe('generateLlmsFullTxt', () => {
    it('should generate correct llms-full.txt format', () => {
      const result = generateLlmsFullTxt(baseOptions);

      expect(result).toContain('# My Project\n\n> A cool project\n');
      expect(result).toContain('---\n\n# Home\nWelcome.\n');
      expect(result).toContain('---\n\n# Getting Started\nStep 1.\n');
      expect(result).toContain('---\n\n# Config\nOptions.\n');
    });

    it('should skip pages with empty content', () => {
      const result = generateLlmsFullTxt({
        ...baseOptions,
        sections: [
          {
            name: '',
            pages: [
              { title: 'Empty', link: '/empty', description: '', content: '' },
              { title: 'Full', link: '/full', description: '', content: 'Has content.' },
            ],
          },
        ],
      });

      expect(result).not.toContain('Empty');
      expect(result).toContain('Has content.');
    });

    it('should handle empty sections', () => {
      const result = generateLlmsFullTxt({
        ...baseOptions,
        sections: [],
      });

      expect(result).toBe('# My Project\n\n> A cool project\n');
    });
  });
});
