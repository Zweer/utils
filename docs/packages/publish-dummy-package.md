---
title: publish-dummy-package
description: Publish dummy packages to npm for OIDC provenance setup in monorepos
---

# publish-dummy-package

A CLI tool to publish dummy packages to npm for OIDC provenance setup in monorepos.

When using npm OIDC (provenance) publishing from CI (e.g., GitHub Actions), the package must already exist on npm. This tool scans your monorepo, finds unpublished packages, and publishes a minimal placeholder so you can then configure OIDC trusted publishers.

## Installation

```bash
npm install -g @zweer/publish-dummy-package
```

## Usage

### CLI

```bash
# Scan workspaces and publish any missing packages
publish-dummy-package

# Custom root directory
publish-dummy-package --root-dir ./my-monorepo

# Dry run (no actual publish)
publish-dummy-package --dry-run

# Restricted access (scoped private)
publish-dummy-package --access restricted
```

If not logged in to npm, the tool will automatically start an interactive `npm login` session.

### Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `--root-dir <PATH>` | `.` (cwd) | Root directory of the monorepo |
| `--access <ACCESS>` | `public` | npm publish access level (`public` or `restricted`) |
| `--dry-run` | `false` | Perform a dry run without publishing |

### Programmatic API

```typescript
import {
  ensureNpmLogin,
  publishDummyPackages,
  resolveWorkspaces,
} from '@zweer/publish-dummy-package'

// Ensure npm login (auto-login if needed)
const username = ensureNpmLogin()

// Resolve workspace package directories from package.json
const packageDirs = resolveWorkspaces('.')

// Publish all unpublished packages
const results = publishDummyPackages({
  rootDir: '.',
  access: 'public',
  dryRun: false,
})
```

## Prerequisites

- Node.js >= 20.5
- Each package must have a valid `package.json` with a `name` field
- The root `package.json` must have a `workspaces` field
