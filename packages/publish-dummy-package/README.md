# @zweer/publish-dummy-package

A CLI tool to publish dummy packages to npm for OIDC provenance setup in monorepos.

When using npm OIDC (provenance) publishing from CI (e.g., GitHub Actions), the package must already exist on npm. This tool scans your monorepo, finds unpublished packages, and publishes a minimal placeholder so you can then configure OIDC trusted publishers.

## Installation

```bash
npm install -g @zweer/publish-dummy-package
```

## Usage

### CLI

```bash
# Scan packages/ and publish any missing packages
publish-dummy-package

# Custom packages directory
publish-dummy-package --packages-dir ./libs

# Dry run (no actual publish)
publish-dummy-package --dry-run

# Restricted access (scoped private)
publish-dummy-package --access restricted
```

### Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `--packages-dir <PATH>` | `./packages` | Path to the packages directory |
| `--access <ACCESS>` | `public` | npm publish access level (`public` or `restricted`) |
| `--dry-run` | `false` | Perform a dry run without publishing |

### Programmatic API

```typescript
import {
  checkNpmLogin,
  discoverWorkspacePackages,
  publishDummyPackages,
} from '@zweer/publish-dummy-package'

// Check npm login
const username = checkNpmLogin()

// Discover packages
const packages = discoverWorkspacePackages('./packages')

// Publish all unpublished packages
const results = publishDummyPackages({
  packagesDir: './packages',
  access: 'public',
  dryRun: false,
})
```

## Prerequisites

- You must be logged in to npm (`npm login`)
- Each package must have a valid `package.json` with a `name` field

## License

MIT
