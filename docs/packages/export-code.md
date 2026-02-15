---
title: export-code
description: Export your entire codebase into a single file, perfect for AI prompts
---

# export-code

A CLI tool to consolidate your entire project's source code into a single, well-formatted text file. Ideal for providing context to Large Language Models (LLMs) like GPT-4, Claude, or for creating a simple project archive.

## Why?

When working with AI models, you often need to provide the full context of your codebase. Copy-pasting dozens of files is tedious and loses the file structure. This tool automates that process, creating a single file that is easy to copy and paste into an AI prompt.

## Features

- Exports all text-based files from your repository
- Ignores files and directories listed in your `.gitignore` by default
- Clearly separates each file's content with its path
- Simple, zero-dependency execution

## Installation

```bash
npm install -g @zweer/export-code
```

Or use it directly with `npx`:

```bash
npx @zweer/export-code --help
```

## Usage

Navigate to the root directory of your project and run the command:

```bash
npx export-code project-context.md
```

If you don't specify an output file, it will default to `docs/EXPORT.md`.

### Output Format

The generated file will have a structure like this:

`````markdown
# EXPORT

## File structure

```
export-code
 ├── .editorconfig
 ├── .env
 ├─> .husky
 │   └── pre-commit
 └── README.md
```

## File export

`src/index.js`:

```javascript
console.log("Hello, World!");
```

---

`src/utils.js`:

```javascript
export const a = () => {
  return 'a';
};
```
`````

## Options

| Argument | Description | Default |
| :--- | :--- | :--- |
| `[outputFile]` | The path where the final text file will be saved | `docs/EXPORT.md` |
| `--ignore-list <paths>` | Comma-separated list of glob patterns to ignore | `''` |

### Ignoring Files

By default, `export-code` respects the rules found in your project's `.gitignore` file. You can provide additional ignore patterns:

```bash
npx export-code --ignore-list "src/generated/**,*.test.ts"
```
