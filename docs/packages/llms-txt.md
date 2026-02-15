---
title: llms-txt
description: Generate llms.txt and llms-full.txt files from a docs directory
---

# llms-txt

A CLI tool to generate `llms.txt` and `llms-full.txt` files from a docs directory (e.g., VitePress).

Follows the [llms.txt specification](https://llmstxt.org/) to make your documentation AI-friendly.

## Installation

```bash
npm install -g @zweer/llms-txt
```

## Usage

### CLI

```bash
# Generate from a VitePress docs directory
llms-txt \
  --project-name "My Project" \
  --project-description "A cool project" \
  --site-url "https://example.com"

# Custom directories
llms-txt \
  --docs-dir ./documentation \
  --out-dir ./documentation/public
```

All options auto-detect from `package.json` when not provided:
- `--project-name` reads `name` (strips scope)
- `--project-description` reads `description`
- `--site-url` derives GitHub Pages URL from `repository.url`

### Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `--project-name <NAME>` | auto-detect | Project name for the header |
| `--project-description <DESC>` | auto-detect | Project description |
| `--site-url <URL>` | auto-detect | Base URL of the site |
| `--docs-dir <PATH>` | `./docs` | Path to the docs directory |
| `--out-dir <PATH>` | `./docs/public` | Output directory |

### Programmatic API

```typescript
import { generateLlmsFullTxt, generateLlmsTxt, scanPages } from '@zweer/llms-txt'

const sections = scanPages('./docs')

const llmsTxt = generateLlmsTxt({
  projectName: 'My Project',
  projectDescription: 'A cool project',
  siteUrl: 'https://example.com',
  sections,
})

const llmsFullTxt = generateLlmsFullTxt({
  projectName: 'My Project',
  projectDescription: 'A cool project',
  siteUrl: 'https://example.com',
  sections,
})
```

## How It Works

1. Scans the docs directory recursively for `.md` files
2. Extracts `title` and `description` from YAML frontmatter (falls back to first `# heading`)
3. Groups pages by directory (each subdirectory becomes a section)
4. Generates `llms.txt` with links and descriptions
5. Generates `llms-full.txt` with the full content of all pages
