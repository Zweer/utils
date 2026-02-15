# Testing Strategy

## Test Framework

### Vitest
- All tests use **Vitest** (NOT Jest, Mocha, or others)
- Configuration in `vitest.config.ts` at root
- Run tests: `npm test` (requires `npm run build` first)
- Coverage: `npm run test:coverage`

### Coverage
- v8 coverage provider
- Coverage includes: statements, branches, functions, lines
- Reporters: text, json, json-summary

## Test Structure

### File Organization
```
packages/<name>/
├── cli/
├── lib/
└── test/
    ├── cli/
    │   ├── index.test.ts
    │   └── program.test.ts
    └── lib/
        ├── badge.test.ts
        └── ...
```

### Test File Naming
- `<name>.test.ts` for unit tests
- Match source file name (e.g., `badge.ts` → `badge.test.ts`)

### Test Structure
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should do something specific', () => {
    // Arrange
    const input = 'test'
    // Act
    const result = doSomething(input)
    // Assert
    expect(result).toBe('expected')
  })
})
```

## Mocking

### When to Mock
- File system operations (use **memfs**)
- External APIs
- `process.cwd()`, `process.exit()`

### When NOT to Mock
- Internal functions (test the real implementation)
- Simple utilities
- Pure functions

### Mock File System with memfs
```typescript
import { vol } from 'memfs'
import { vi } from 'vitest'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
  vol.fromJSON({
    '/project/package.json': JSON.stringify({ name: 'test', version: '1.0.0' })
  })
})
```

## Best Practices

### Test Naming
- Use `should` in test names
- Be specific: "should throw error when file not found"

### Arrange-Act-Assert
- Follow AAA pattern in every test

### Avoid Test Interdependence
- Each test must be independent
- Use `beforeEach` for setup

### Test Edge Cases
- Empty arrays/strings
- Null/undefined
- Invalid input
- Boundary values
