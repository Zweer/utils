# Commit Message Format

**IMPORTANT**: The agent NEVER commits, pushes, or creates tags. The developer handles all git operations manually.

## Format

Use conventional commits with gitmoji as text (not emoji):

```
type(scope): :emoji_code: short description

Detailed explanation of what changed and why.
```

## Types

- `feat` — New feature (`:sparkles:`)
- `fix` — Bug fix (`:bug:`)
- `perf` — Performance improvement (`:zap:`)
- `docs` — Documentation (`:memo:`)
- `chore` — Maintenance tasks (`:wrench:`, `:arrow_up:`, `:bookmark:`)
- `refactor` — Code refactoring (`:recycle:`)
- `test` — Tests (`:white_check_mark:`)
- `style` — Code formatting (`:art:`)

## Scope

Use package name without scope prefix: `coverage-badge-readme`, `export-code`.
Scope is optional for cross-cutting changes.

## Examples

```
feat(coverage-badge-readme): :sparkles: add custom badge template support
fix(export-code): :bug: handle empty directories in tree generation
chore: :arrow_up: upgrade dependencies
refactor: :recycle: migrate from ESLint to Biome
```

## Breaking Changes

For breaking changes, add `!` after the type/scope and include `BREAKING CHANGE:` in the body.
