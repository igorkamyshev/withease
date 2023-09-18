# Releases policy

The main goal of With Ease libraries is to **make developer experience better**, as a part of this strategy we are committing to some rules of releases.

## Stable releases

After the first stable release, we will maintain **backward compatibility for 2 years** in any library. Of course, we can introduce some breaking changes, but we commit that any breaking change will be prepended by deprecation warning at least for one year.

::: tip
Some libraries can have different rules of releases, but it will be described in the documentation of the library. For example, `@withease/i18next` release cycle is bound to the release cycle of `i18next` itself.
:::

## 0.x.x releases

Until API would be stabilized, we are going to release versions 0.x.x as pre-releases. Each version can include breaking changes, but it will be soundness.
