# Build & Tooling

## Build System

### tsdown
- **tsdown** for building all packages (NOT tsc, esbuild, rollup, or others)
- Configuration: `tsdown.config.ts` at root
- Workspace mode: builds all packages in one pass
- Outputs: `.mjs` files + `.d.ts` type definitions + sourcemaps

### Build Output
```
packages/<name>/
└── dist/
    ├── cli/
    │   └── index.mjs
    ├── lib/
    │   └── index.mjs
    └── ...
```

### Build Commands
```bash
npm run build              # Build all packages
```

## Package Configuration

### package.json Exports
```json
{
  "type": "module",
  "exports": {
    ".": "./dist/lib/index.mjs",
    "./package.json": "./package.json"
  },
  "bin": "./dist/cli/index.mjs",
  "files": ["dist"]
}
```

### TypeScript Configuration
- Root `tsconfig.json` applies to all packages
- No per-package `tsconfig.json` needed
- Strict mode enabled
- ES2024 target (node24)
- Node resolution

## Linting & Formatting

### Biome
- **Biome** for linting and formatting (NOT ESLint/Prettier)
- Configuration: `biome.json` at root
- Single quotes, 100 line width
- Runs on pre-commit hook via husky + lint-staged

### Commands
```bash
npm run lint               # Check all (biome + typecheck + lockfile + package.json)
npm run lint:format        # Biome check + fix
npm run lint:typecheck     # TypeScript check
```

## Git Hooks

### Husky + lint-staged
- Pre-commit: runs lint-staged (biome, tests, build)
- Commit-msg: validates conventional commit format via commitlint

### commitlint
- Validates conventional commit format
- Configuration in root `package.json` (`commitlint` field)

## Package Manager

### npm
- Use **npm** (NOT pnpm or yarn)
- Lock file: `package-lock.json`
- Workspaces enabled in root `package.json`

## CI/CD

### GitHub Actions
- Workflow: `.github/workflows/ci.yml`
- Tests on Node 20, 22, 24
- Release via `bonvoy shipit` on push to main

### Release Process
- Automated via bonvoy in CI
- Independent versioning per package
- Creates git tags, GitHub releases, publishes to npm

## Development Workflow

### Initial Setup
```bash
npm install
npm run build
npm test
```

### Before Commit
```bash
npm run lint
npm test
npm run test:coverage
```
