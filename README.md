# DSP Toolkit

[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-blueviolet.svg)](https://turbo.build/repo)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Node.js](https://img.shields.io/badge/node-24.22.1-brightgreen.svg)](https://nodejs.org/)

A Turborepo monorepo containing reusable DSP libraries.

## Packages

| Package | Description |
|---------|-------------|
| [@agrimetrics/services](packages/services) | Shared service clients and API-facing abstractions |
| [@agrimetrics/agrieventlib](packages/events) | Event publishing and messaging helpers |
| [@agrimetrics/service-event-types](packages/types) | Shared event and service contract types |
| [@dsp-toolkit/shared-config](packages/shared-config) | Shared ESLint, Prettier, Vite, Vitest, and semantic-release config |
| [@dsp-toolkit/typescript-config](packages/typescript-config) | Shared TypeScript base and library configuration |

## Getting Started

### Prerequisites

- **Node and pnpm** at the versions in [`.tool-versions`](.tool-versions), the single
  source of truth: mise or asdf pick them up automatically, and `pnpm run check:versions`
  fails if anything drifts from it (published packages state `engines.node` as `>=` it).
- **A GitHub token with `read:packages`** in `GITHUB_PACKAGES_TOKEN`, for the private
  `@agrimetrics/*` packages: the committed [`.npmrc`](.npmrc) reads it from the
  environment.

### Installation

```bash
pnpm install
```

### Bootstrap Validation

Use this one command to verify environment + install + full quality gate:

```bash
pnpm run bootstrap:check
```

The command:
- Checks the running Node.js and pnpm against `.tool-versions` (`check:versions`)
- Installs dependencies with a frozen lockfile
- Runs the full monorepo quality gate

## Development Workflow

### Full Quality Gate

```bash
pnpm run quality:ci
```

Runs `check:versions` and `security:audit` (audit-ci, high and critical only), then lint,
format check, typecheck, tests, and build across all applicable packages. The pre-push
hook runs it.

### Changed-Only Quality Gate

```bash
pnpm run quality:ci:changed
```

Runs the same checks, with the Turbo tasks limited to packages affected by changes
between `origin/main...HEAD`.

### Package-Scoped Quality Gates

```bash
pnpm run quality:ci:services
pnpm run quality:ci:events
pnpm run quality:ci:types
```

These are thin wrappers over the single root quality facade and are useful for focused development.

## Scripts Reference

All scripts are run from repo root with `pnpm <script>`.

### Build and Quality

| Script | Description |
|--------|-------------|
| `build` | Build all packages through Turborepo |
| `typecheck` | Run TypeScript checks across all packages |
| `lint` | Run ESLint across all packages |
| `lint:fix` | Run ESLint with autofix enabled |
| `format` | Format files with Prettier |
| `format:check` | Verify formatting without changes |
| `test` | Run Vitest in dev/watch mode where applicable |
| `test:ci` | Run Vitest in CI mode |
| `check:versions` | Check Node/pnpm and `engines` against `.tool-versions` |
| `security:audit` | audit-ci: fail on high and critical advisories |
| `quality:ci` | Full quality facade: check:versions + security:audit + lint + format check + typecheck + test + build |
| `quality:ci:changed` | Full quality facade scoped to changed packages |
| `quality:ci:services` | Full quality facade scoped to services package |
| `quality:ci:events` | Full quality facade scoped to events package |
| `quality:ci:types` | Full quality facade scoped to types package |

### Releases

| Script | Description |
|--------|-------------|
| `release` | Run release pipeline task in Turborepo |
| `release:services` | Run semantic-release for services package |
| `release:events` | Run semantic-release for events package |
| `release:types` | Run semantic-release for types package |

### Utilities

| Script | Description |
|--------|-------------|
| `bootstrap:check` | Verify runtime versions, install deps, run full quality gate |
| `new:package` | Scaffold a new package with standard config and scripts |
| `clean` | Clean package build artifacts through Turborepo |
| `clean:all` | Clean build artifacts and local node_modules folders |
| `unused:code` | Run knip analysis for unused exports/files |
| `syncpack:list` | List dependency version mismatches |
| `syncpack:fix` | Auto-fix dependency version mismatches |
| `syncpack:lint` | Run syncpack lint checks |

## Advisory checking

Dependencies are checked for known vulnerabilities by
[audit-ci](https://github.com/IBM/audit-ci) (`pnpm run security:audit`), at high and
critical only, as part of every quality gate. Reviewed exceptions go in
[`audit-ci.jsonc`](audit-ci.jsonc)'s `allowlist`, each with a comment giving the reason;
it's currently empty.

To fix a vulnerable package, update it, or the direct dependency that pulls it in, within
its version range (`pnpm update -r`). If a transitive package can only be forced to a
fixed release, add an entry to `overrides` in `pnpm-workspace.yaml` pinning the **fixed**
version, and revisit it later.

## Git hooks and commit convention

`pnpm install` runs the `prepare` script (skipped when `CI=true`), which installs the
[Husky](https://typicode.github.io/husky/) hooks and sets `.gitmessage` as this repo's
`commit.template`:

- **commit-msg** runs [commitlint](https://commitlint.js.org/). The allowed types and
  scopes come from the first line of [`.gitmessage`](.gitmessage) (`feat|fix|docs`, and
  scopes `project`, `devops` and the package folders: `services`, `events`, `types`,
  `shared-config`, `typescript-config`), and every commit needs a body. Mark breaking
  changes with a `BREAKING CHANGE:` footer; the `feat!:` shorthand is rejected. Commit
  types drive the version semantic-release picks for each package.
- **pre-push** runs `pnpm run quality:ci`.

Check the hooks work:

```sh
git config core.hooksPath     # .husky/_
# Should be rejected — wrong type
printf 'chore(devops): x\n\nlong enough body text here\n' | pnpm exec commitlint
# Should be rejected — missing body
echo "fix(devops): x" | pnpm exec commitlint
# Should be rejected — the ! shorthand; spell it out in a BREAKING CHANGE: footer
printf 'fix(devops)!: x\n\nlong enough body text here\n' | pnpm exec commitlint
# Should pass
printf 'fix(devops): x\n\nlong enough body text here\n' | pnpm exec commitlint
```

## Dead code analysis (knip)

`pnpm run unused:code` runs [knip](https://knip.dev). It isn't part of the quality gates:
findings are a tidy-up list. Until each package's source is migrated in (see
[Notes](#notes)), knip reports most of their declared dependencies as unused; that's
expected, and they shouldn't be removed, since the migrated code uses them.

## CI and Release Workflows

### Quality workflow

The QUALITY workflow enforces two modes:

- Pull requests to `main`: changed-only quality gate (`quality:ci:changed`)
- Pushes to `main` and manual dispatch: full quality gate (`quality:ci`)

This keeps PR feedback fast while preserving full verification on the mainline.

### Release workflow

The RELEASE workflow supports manual package selection (`services`, `events`, `types`, `all`) and executes:

1. package-specific quality gate
2. package-specific semantic-release

All package releases use independent tag formats via each package `release.config.ts`.

## Scaffolding a New Package

Use the package generator:

```bash
pnpm run new:package -- my-new-lib
```

Optional custom scope:

```bash
pnpm run new:package -- my-new-lib --scope=@agrimetrics
```

The generator creates:
- `packages/<name>/package.json`
- `packages/<name>/tsconfig.json`
- `packages/<name>/eslint.config.ts`
- `packages/<name>/prettier.config.ts`
- `packages/<name>/release.config.ts`
- `packages/<name>/vite.config.ts`
- `packages/<name>/README.md`
- `packages/<name>/src/index.ts`

It also wires root scripts:
- `quality:ci:<name>`
- `release:<name>`

After generation, if the package should be releasable in CI, add it to `.github/workflows/release.yml` package options and `ALL_PACKAGES`.

## Project Structure

```text
dsp-toolkit/
├── .github/workflows/         # CI quality and release workflows
├── packages/
│   ├── services/              # @agrimetrics/services
│   ├── events/                # @agrimetrics/agrieventlib
│   ├── types/                 # @agrimetrics/service-event-types
│   ├── shared-config/         # Shared lint/build/release config
│   └── typescript-config/     # Shared tsconfig presets
├── scripts/                   # Root automation utilities
├── turbo.json                 # Turborepo task graph
├── pnpm-workspace.yaml        # Workspace package globs
└── package.json               # Root scripts and toolchain setup
```

## Notes

- Root and package configs are TypeScript-first (`*.ts`) for consistency.
- Root quality scripts are the single source of truth for all gates.
- Husky pre-push runs the root quality facade to avoid drift from CI.
- The package sources are placeholders until migrated: each `packages/*/src/index.ts`
  gives the `cp` command to bring in the original library. `@agrimetrics/service-event-types`
  declares zod 4, as the original does from 11.0.0.
