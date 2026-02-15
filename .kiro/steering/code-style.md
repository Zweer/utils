# Code Style & Best Practices

## TypeScript

### Strict Mode
- Always use strict mode (enabled in `tsconfig.json`)
- No `any` types — use `unknown` or proper types
- Explicit return types on all exported functions
- Explicit parameter types always

### Module System
- ES modules only (`"type": "module"` in package.json)
- Use `.js` extensions in imports (TypeScript requirement for ES modules)
- Example: `import { foo } from './bar.js'` (not `./bar` or `./bar.ts`)

### Naming Conventions
- **camelCase** for variables, functions, methods
- **PascalCase** for classes, interfaces, types
- **UPPER_SNAKE_CASE** for constants
- **kebab-case** for file names

### Code Organization
```typescript
// 1. Type imports
import type { Context } from './types.js'

// 2. Node.js imports
import { readFileSync } from 'node:fs'

// 3. External imports
import { Command } from 'commander'

// 4. Internal imports
import { helper } from './helper.js'

// 5. Types/Interfaces
export interface MyConfig {
  option: string
}

// 6. Constants
const DEFAULT_TIMEOUT = 5000

// 7. Functions/Classes
export function myFunction(): void {
  // ...
}
```

## Code Quality

### Linting & Formatting
- **Biome** for linting and formatting (NOT ESLint/Prettier)
- Single quotes for strings
- 100 character line width
- Run `npm run lint` before committing

### Minimal Code
- Write only what's necessary
- No premature abstractions
- No unused code or imports
- No commented-out code in commits

### Error Handling
- Always throw typed errors with clear messages
- Include context in error messages

### Async/Await
- Prefer `async/await` over `.then()/.catch()`
- Always handle errors in async functions

## Dependencies

### Minimal Dependencies
- Only add dependencies when absolutely necessary
- Prefer native Node.js APIs when possible

### Version Pinning
- Use `^` for dependencies (allow minor/patch updates)
- Keep dependencies up to date — always use latest stable versions

## File Structure

### Package Layout
```
packages/<name>/
├── cli/
│   ├── index.ts          # bin entry
│   └── program.ts        # Commander program
├── lib/
│   ├── index.ts          # Re-exports
│   └── ...               # Implementation
├── test/
│   ├── cli/              # CLI tests
│   └── lib/              # Lib tests
├── package.json
├── README.md
└── CHANGELOG.md
```

## Security

### No Secrets in Code
- Never commit API keys, tokens, passwords
- Use environment variables

### Input Validation
- Validate all external input (config, CLI args)
- Sanitize file paths
