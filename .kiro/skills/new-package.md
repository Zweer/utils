# Create New Package in Monorepo

## 1. Create directory structure

```bash
mkdir -p packages/<name>/{cli,lib,test/{cli,lib}}
```

## 2. Read existing package metadata

From root `package.json` or an existing package, extract:
- `author`, `license`, `repository`, `homepage`, `bugs`

## 3. Create package.json

```json
{
  "name": "@zweer/<name>",
  "version": "0.0.0",
  "description": "<Short description>",
  "keywords": [],
  "homepage": "https://github.com/Zweer/utils/tree/main/packages/<name>#readme",
  "bugs": { "url": "https://github.com/Zweer/utils/issues" },
  "repository": { "type": "git", "url": "git+https://github.com/Zweer/utils.git", "directory": "packages/<name>" },
  "license": "MIT",
  "author": { "name": "Zweer", "email": "n.olivieriachille@gmail.com" },
  "type": "module",
  "exports": { ".": "./dist/lib/index.mjs", "./package.json": "./package.json" },
  "bin": "./dist/cli/index.mjs",
  "files": ["dist"],
  "dependencies": {},
  "engines": { "node": ">= 20.5" },
  "publishConfig": { "access": "public", "provenance": true }
}
```

## 4. Create cli/index.ts

```typescript
#!/usr/bin/env node
import { buildProgram } from './program.js'
buildProgram().parse()
```

## 5. Create cli/program.ts

```typescript
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Command } from '@commander-js/extra-typings'

interface Package { name: string; version: string; description: string }

export function buildProgram(): Command {
  const pkg = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', '..', 'package.json'), 'utf8'),
  ) as Package

  return new Command()
    .name(pkg.name.replace('@zweer/', ''))
    .description(pkg.description)
    .version(pkg.version)
    .action(() => { /* implementation */ })
}
```

## 6. Create lib/index.ts

Re-export all public API from this file.

## 7. Create test files

Match the existing test structure with `cli/` and `lib/` subdirectories.

## 8. Create README.md and CHANGELOG.md

## 9. Add scope to .vscode/settings.json

If `conventionalCommits.scopes` exists, add the package name (without scope prefix).

## 10. Update root README.md packages table

## 11. Install, build, test

```bash
npm install && npm run build && npm test
```

**Note**: tsconfig.json is NOT needed per package — TypeScript uses the root tsconfig.json.
