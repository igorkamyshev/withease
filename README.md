# With Ease

A set of libraries and recipes to make frontend development easier thanks to Effector.

## Maintains

### Getting started

- clone repo
- install deps via `pnpm install`
- make changes
- make sure that your changes is passing checks:
  - run tests via `pnpm run -r test:run`
  - try to build it via `pnpm run -r build`
  - format code via `pnpm run format:check`
- fill in changes via `pnpm changeset`
- open a PR
- enjoy 🎉

### Release workflow

Releases of Farfetched are automated by [changesets](https://github.com/changesets/changesets) and GitHub Actions. Your only duty is creating changeset for every PR, it is controlled by [Changes-action](./.github/workflows/changes.yml).

After merging PR to master-branch, [Version-action](./.github/workflows/version.yml) will update special PR with the next release. To publish this release, just merge special PR and wait, [Release-action](./.github/workflows/release.yml) will publish packages.

### Repository management

#### New package creation

Copy-paste `packages/web-api` directory, rename it to the package name. Then, update `package.json`, `README.md` and `vite.config.js` files. Then, delete `CHANGELOG.md` file and any other files that are not needed in the new package.

Fancy generator will be added in the future.
