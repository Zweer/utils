import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { scanPages } from '../../lib/scan.js';

const docsDir = '/fake/docs';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

describe('lib -> scan', () => {
  afterEach(() => {
    vol.reset();
  });

  it('should scan pages with frontmatter', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'index.md': '---\ntitle: Home\ndescription: Welcome\n---\n# Home Page\nContent here.',
      },
    });

    const sections = scanPages(docsDir);

    expect(sections).toEqual([
      {
        name: '',
        pages: [
          {
            title: 'Home',
            link: '/',
            description: 'Welcome',
            content: '# Home Page\nContent here.',
          },
        ],
      },
    ]);
  });

  it('should fall back to first heading when no frontmatter title', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'about.md': '# About Us\nSome content.',
      },
    });

    const sections = scanPages(docsDir);

    expect(sections[0].pages[0].title).toBe('About Us');
    expect(sections[0].pages[0].description).toBe('');
  });

  it('should fall back to filename when no title or heading', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'readme.md': 'Just some text without a heading.',
      },
    });

    const sections = scanPages(docsDir);

    expect(sections[0].pages[0].title).toBe('readme');
  });

  it('should group pages by directory into sections', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'index.md': '---\ntitle: Home\n---\nHome content.',
        guide: {
          'getting-started.md':
            '---\ntitle: Getting Started\ndescription: Quick start\n---\nGuide content.',
          'config.md': '---\ntitle: Configuration\n---\nConfig content.',
        },
        plugins: {
          'overview.md': '---\ntitle: Overview\ndescription: Plugin system\n---\nPlugins content.',
        },
      },
    });

    const sections = scanPages(docsDir);

    expect(sections).toHaveLength(3);
    expect(sections[0].name).toBe('');
    expect(sections[0].pages).toHaveLength(1);
    expect(sections[1].name).toBe('Guide');
    expect(sections[1].pages).toHaveLength(2);
    expect(sections[2].name).toBe('Plugins');
    expect(sections[2].pages).toHaveLength(1);
  });

  it('should generate correct links', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'index.md': '# Home',
        'about.md': '# About',
        guide: {
          'index.md': '# Guide',
          'setup.md': '# Setup',
        },
      },
    });

    const sections = scanPages(docsDir);
    const allPages = sections.flatMap((s) => s.pages);

    expect(allPages.find((p) => p.title === 'Home')?.link).toBe('/');
    expect(allPages.find((p) => p.title === 'About')?.link).toBe('/about');
    expect(allPages.find((p) => p.title === 'Guide')?.link).toBe('/guide/');
    expect(allPages.find((p) => p.title === 'Setup')?.link).toBe('/guide/setup');
  });

  it('should capitalize and format section names from directory names', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'getting-started': {
          'intro.md': '# Intro',
        },
      },
    });

    const sections = scanPages(docsDir);

    expect(sections[0].name).toBe('Getting started');
  });

  it('should skip hidden directories', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        '.vitepress': {
          'config.md': '# Config',
        },
        'index.md': '# Home',
      },
    });

    const sections = scanPages(docsDir);

    expect(sections).toHaveLength(1);
    expect(sections[0].pages).toHaveLength(1);
    expect(sections[0].pages[0].title).toBe('Home');
  });

  it('should return empty array for empty directory', () => {
    vol.fromNestedJSON({ [docsDir]: {} });

    const sections = scanPages(docsDir);

    expect(sections).toEqual([]);
  });

  it('should return empty array when docs directory does not exist', () => {
    const sections = scanPages('/nonexistent/docs');

    expect(sections).toEqual([]);
  });

  it('should strip frontmatter from content', () => {
    vol.fromNestedJSON({
      [docsDir]: {
        'page.md': '---\ntitle: Test\ndescription: Desc\n---\nBody content only.',
      },
    });

    const sections = scanPages(docsDir);

    expect(sections[0].pages[0].content).toBe('Body content only.');
  });
});
