# Build & Tooling

## Build System

### tsdown
- **tsdown** for building all packages (NOT tsc, esbuild, rollup)
- Configuration: `tsdown.config.ts` at root
- Workspace mode: builds all packages in one pass
- Outputs: `.mjs` + `.d.ts` + sourcemaps
- tsc is only used for type-checking (`tsc --noEmit`)

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
npm run clean              # Remove dist/
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
- Uses `.editorconfig` for indent settings
- Import sorting with grouped blank lines

### Commands
```bash
npm run lint               # All linters in parallel
npm run lint:format        # Biome check + fix
npm run lint:typecheck     # TypeScript check
npm run lint:lockfile      # Lockfile security
npm run lint:package       # package.json validation
npm run lint:sort_package  # Sort package.json keys
npm run lint:engines       # Validate engine compatibility
```

## Git Hooks

### Lefthook
- **Lefthook** for git hooks (NOT husky + lint-staged)
- Configuration: `lefthook.yml` at root
- Pre-commit: biome → lockfile → package-lint → sort → build → typecheck → test
- Commit-msg: commitlint validation
- Built-in staging support (`stage_fixed: true`)

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

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build` | Build with tsdown |
| `npm run clean` | Remove dist/ |
| `npm run lint` | All linters in parallel |
| `npm run lint:format` | Biome check + fix |
| `npm run lint:typecheck` | TypeScript check |
| `npm run lint:lockfile` | Lockfile security |
| `npm run lint:package` | package.json validation |
| `npm run lint:sort_package` | Sort package.json keys |
| `npm run lint:engines` | Validate engine compatibility |
| `npm test` | Run tests |
| `npm run test:coverage` | Tests with coverage |
