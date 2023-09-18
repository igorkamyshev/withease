# With Ease

A set of libraries and recipes to make frontend development easier thanks to Effector.

## Maintains

### Getting started

- clone repo
- install deps via `pnpm install`
- make changes
- make sure that your changes is passing checks:
  - run tests via `pnpm test`
  - run type tests via `pnpm test:types`
  - run linter via `pnpm lint`
  - try to build it via `pnpm build`
  - format code via `pnpm format`
- fill in changes via `pnpm changes`
- open a PR
- enjoy 🎉

### Release workflow

Releases of With Ease are automated by [changesets](https://github.com/changesets/changesets) and GitHub Actions. Your only duty is creating changeset for every PR, it is controlled by [Changes-action](./.github/workflows/changes.yml).

After merging PR to master-branch, [Version-action](./.github/workflows/version.yml) will update special PR with the next release. To publish this release, just merge special PR and wait, [Release-action](./.github/workflows/release.yml) will publish packages.
