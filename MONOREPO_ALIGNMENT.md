# dsp-toolkit ↔ mapping-apps-dsp3 Alignment

This document tracks how `dsp-toolkit` aligns with `mapping-apps-dsp3` to reduce developer friction when jumping between codebases.

## Changes Made

### 1. **Shared Configuration Location**
- **Before**: `tooling/tsconfig`
- **After**: `packages/typescript-config`
- **Reason**: Matches mapping-apps-dsp3 convention; keeps all publishable packages in `/packages`.

### 2. **Workspace Protocol**
- **Before**: `"@dsp-toolkit/tsconfig": "*"`
- **After**: `"@dsp-toolkit/typescript-config": "workspace:*"`
- **Reason**: Explicit workspace protocol is clearer and matches mapping-apps-dsp3 usage.

### 3. **Turbo Configuration**
- **Added**: `"ui": "tui"` for terminal UI (same as mapping-apps-dsp3)
- **Enhanced**: All tasks now define explicit `inputs` and `outputs` for better caching and reproducibility
- **Added**: `env` tracking for CI tasks (ready for future expansion)

### 4. **Package Management**
- **Added**: `.syncpackrc.json` for version consistency enforcement
  - Enforces workspace protocol for local `@dsp-toolkit/*` packages
  - Prevents accidental version mismatches across packages
  - Run `pnpm syncpack:lint` in CI

### 5. **Package.json Field Ordering**
- **Standardized**: All packages now follow the same field order:
  - name, version, private, type, engines
  - description, sideEffects, main, module, types, exports
  - files, scripts, dependencies, devDependencies, publishConfig
- **Reason**: Reduces diff noise and makes field lookups consistent

### 6. **Root Scripts**
- **Added**: `syncpack:list`, `syncpack:fix`, `syncpack:lint` for dependency management

## Structure Comparison

### dsp-toolkit (after alignment)
```
packages/
├── typescript-config/    ← shared tsconfig (moved from tooling/)
├── services/
├── events/
└── types/
```

### mapping-apps-dsp3 (reference)
```
packages/
├── typescript-config/    ← same location
├── shared-config/
├── shared/
apps/
├── water-quality/
├── wetland-inventory/
└── ecology-and-fish/
```

## Developer Experience Impact

| Task | dsp-toolkit | mapping-apps-dsp3 | Notes |
|---|---|---|---|
| Add dependency | `pnpm add pkg` | `pnpm add pkg` | ✓ Identical |
| Check version consistency | `pnpm run syncpack:lint` | `pnpm run syncpack:lint` | ✓ Identical |
| Build all | `pnpm run build` | `turbo build` | Both via turbo, same semantics |
| Lint | `pnpm run lint` | `turbo lint` | ✓ Identical |
| Format | `pnpm run format` | Handled per-package | ✓ Identical |
| TypeScript config location | `packages/typescript-config` | `packages/typescript-config` | ✓ Identical |

## Not Aligned (By Design)

| Aspect | dsp-toolkit | mapping-apps-dsp3 | Reason |
|---|---|---|---|
| App/Package split | Everything in `/packages` | `/apps` + `/packages` | dsp-toolkit is library-only; no apps |

## Migration Checklist

- [x] Move `tooling/tsconfig` → `packages/typescript-config`
- [x] Update all `tsconfig.json` extends paths
- [x] Add `.syncpackrc.json` with workspace protocol rules
- [x] Add syncpack scripts to root `package.json`
- [x] Standardize field ordering in all `package.json` files
- [x] Add "ui": "tui" to `turbo.json`
- [x] Add explicit inputs/outputs to all turbo tasks
- [x] Switch from npm to pnpm (add `pnpm-workspace.yaml`, update packageManager field)

## Next Steps

1. Run `pnpm install` to wire workspaces
2. Run `pnpm run syncpack:lint` to verify version consistency
3. Update CI/CD to run `pnpm run syncpack:lint` in quality checks
4. Consider documenting developer onboarding (one page) comparing the two monorepos
