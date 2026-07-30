# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

When you make a change to a published `@laynjs/*` package, add a changeset:

```bash
pnpm changeset
```

Pick the affected packages and the bump type (patch / minor / major), write a short user-facing summary, and commit the generated Markdown file together with your change. On merge to `main`, the release workflow opens a "Version Packages" pull request; merging that publishes to npm.
