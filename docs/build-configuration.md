# Build Configuration

## TypeScript Configuration Strategy

This project uses separate TypeScript configurations for **production builds** and **testing** to avoid conflicts between Next.js and Vitest type definitions.

### Configuration Files

#### `tsconfig.json` (Production/Build)
- **Purpose**: Used by Next.js for production builds and IDE type checking
- **Key Settings**:
  - Excludes `tests/` directory
  - Excludes `vitest.config.ts`
  - Does NOT include Vitest global types
  - Includes all application code (app/, components/, lib/, etc.)

#### `tsconfig.test.json` (Testing)
- **Purpose**: Used by Vitest for running tests
- **Key Settings**:
  - Extends `tsconfig.json`
  - Adds Vitest global types (`vitest/globals`, `@testing-library/jest-dom`)
  - Includes test files and Vitest config

#### `vitest.config.ts`
- **Purpose**: Vitest test runner configuration
- **Key Settings**:
  - References `tsconfig.test.json` for type checking
  - Configures test environment (jsdom)
  - Enables global test functions (describe, it, expect)

### Why This Approach?

The issue arose because Next.js build was trying to type-check Vitest's `@vitejs/plugin-react` type definitions, which use CommonJS export syntax (`"module.exports"`) that's invalid in TypeScript module context.

**Solution**: Separate concerns by:
1. Excluding test-related code from Next.js builds
2. Using dedicated test config for Vitest
3. Leveraging TypeScript's `extends` feature to share base config

### Build Commands

```bash
# Production build (uses tsconfig.json)
npm run build

# Run tests (uses tsconfig.test.json via vitest.config.ts)
npm test

# Type checking for application code
npx tsc --noEmit

# Type checking for tests
npx tsc --noEmit -p tsconfig.test.json
```

### Expected Build Warnings

During `npm run build`, you may see warnings like:

```
Warning: React Hook useEffect has a missing dependency: 'supabase'
```

These are non-blocking linting warnings and don't prevent deployment.

You may also see:

```
Dynamic server usage: Route /api/... couldn't be rendered statically because it used `cookies`
```

These are **expected** for API routes that require authentication. They'll be server-rendered on demand, which is the correct behavior.

### Build Success Indicators

✅ **Successful build output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (35/35)
✓ Finalizing page optimization
```

✅ **All tests passing**:
```
Test Files  8 passed (8)
     Tests  108 passed (108)
```

## Deployment Checklist

Before deploying to production:

- [x] Production build succeeds (`npm run build`)
- [x] All tests pass (`npm test`)
- [x] TypeScript compilation passes (no errors)
- [ ] Environment variables configured (.env.local)
- [ ] Database migrations applied
- [ ] Supabase project configured
- [ ] Vercel project created and linked

## Troubleshooting

### Build fails with "Identifier expected" error

**Symptom**: TypeScript error in `@vitejs/plugin-react/dist/index.d.ts`

**Solution**: Ensure `tsconfig.json` excludes `tests/` and `vitest.config.ts`:

```json
{
  "exclude": [
    "node_modules",
    "tests",
    "vitest.config.ts"
  ]
}
```

### Tests fail with "describe is not defined"

**Symptom**: Test runner doesn't recognize global test functions

**Solution**: Ensure `vitest.config.ts` has:

```typescript
test: {
  globals: true,
  typecheck: {
    tsconfig: './tsconfig.test.json'
  }
}
```

### IDE shows type errors in test files

**Symptom**: VS Code doesn't recognize `describe`, `it`, `expect` in test files

**Solution**: Ensure `tsconfig.test.json` includes:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

## Related Documentation

- [Next.js TypeScript Configuration](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Vitest Configuration](https://vitest.dev/config/)
- [Deployment Guide](./deployment.md)
