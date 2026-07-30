# Contributing to layn

Thanks for your interest in improving layn. This document covers the development workflow and the conventions the codebase follows.

## Prerequisites

- **Node.js** >= 20
- **pnpm** (the repository is a pnpm workspace; do not use npm or yarn)

## Getting started

```bash
pnpm install
pnpm check       # Biome lint + format, Prettier for .astro/.vue/.svelte/.html, LOC gate
pnpm typecheck   # tsc across every package, includes test files
pnpm test        # Vitest unit tests
pnpm build       # tsc -b per package
pnpm test:e2e    # Playwright e2e (run `pnpm build` first; needs Chromium)
```

## Repository layout

- `packages/*` - published libraries (`@laynjs/*`).
- `examples/*` - one runnable reference app per framework, each owning its Playwright e2e under `e2e/`.
- `apps/*` - the website: `apps/home`, `apps/docs`, `apps/playground` (private, not published).

## Conventions

These are enforced by `pnpm check` and code review:

- **No comments in code.** Names carry meaning. Docs and READMEs are the exception.
- **No em dash or en dash** anywhere - use a hyphen, a colon, or restructure.
- **Types are separated from logic.** Shared/public types live in `src/types/`; feature-internal types live in that feature's `types.ts`. No `interface`/`type` declarations in a logic file.
- **No magic constants in logic** - named constants live in `constants.ts`.
- **Max 200 lines per source file** (tests and fixtures exempt).
- **`@laynjs/core` has zero runtime dependencies** and is DOM-free.
- **ESM only**, `module: NodeNext`, explicit `.js` extensions on relative imports.

## Changesets

Every change that affects a published package must include a changeset:

```bash
pnpm changeset
```

Pick the affected packages and the bump type (patch / minor / major), and write a short, user-facing summary. Commit the generated file in `.changeset/` with your change. The release workflow uses these to version and publish.

## Pull requests

1. Fork and branch from `main`.
2. Make your change with tests.
3. Run `pnpm check && pnpm typecheck && pnpm test && pnpm build`.
4. Add a changeset (see above) if you touched a published package.
5. Open a pull request with a clear description of the problem and the fix.

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
