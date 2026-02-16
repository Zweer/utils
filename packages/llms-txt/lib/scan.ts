import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

import type { Page, Section } from './types.js';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const FIELD_RE = (key: string): RegExp => new RegExp(`^${key}:\\s*(.+)$`, 'm');
const HEADING_RE = /^#\s+(.+)$/m;

function parseFrontmatter(content: string): { title?: string; description?: string; body: string } {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { body: content };

  const fm = match[1];
  const body = match[2];

  return {
    title: fm.match(FIELD_RE('title'))?.[1]?.trim(),
    description: fm.match(FIELD_RE('description'))?.[1]?.trim(),
    body,
  };
}

function toLink(filePath: string, docsDir: string): string {
  const rel = relative(docsDir, filePath).replace(/\.md$/, '').replace(/\\/g, '/');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) return `/${rel.slice(0, -6)}/`;
  return `/${rel}`;
}

function toSectionName(dirName: string): string {
  return dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');
}

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

export function scanPages(docsDir: string): Section[] {
  if (!existsSync(docsDir)) {
    return [];
  }

  const files = collectMarkdownFiles(docsDir);
  const sectionMap = new Map<string, Page[]>();

  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf-8');
    const { title, description, body } = parseFrontmatter(raw);
    const link = toLink(filePath, docsDir);

    const resolvedTitle = title ?? body.match(HEADING_RE)?.[1]?.trim() ?? basename(filePath, '.md');

    const relDir = relative(docsDir, filePath).replace(/\\/g, '/');
    const sectionKey = relDir.includes('/') ? relDir.split('/')[0] : '';

    const page: Page = {
      title: resolvedTitle,
      link,
      description: description ?? '',
      content: body.trim(),
    };

    const pages = sectionMap.get(sectionKey) ?? [];
    pages.push(page);
    sectionMap.set(sectionKey, pages);
  }

  const sections: Section[] = [];

  // Root pages first (no section)
  const rootPages = sectionMap.get('');
  if (rootPages?.length) {
    sections.push({ name: '', pages: rootPages });
  }

  // Then named sections
  for (const [key, pages] of sectionMap) {
    if (key !== '') {
      sections.push({ name: toSectionName(key), pages });
    }
  }

  return sections;
}
