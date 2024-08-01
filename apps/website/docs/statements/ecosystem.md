<script setup>
    import { ecosystem } from '../ecosystem.ts'
    console.log(ecosystem)
</script>

# Ecosystem

The main goal of With Ease project is providing not only an information about Effector itself and its ecosystem but also to be an **opinionated guide** for developers who are using Effector in their projects.

The part of this guidance is a list of libraries that could be used in your application with no fear of breaking changes or lack of support. We manually select libraries that are following the same principles as Effector itself: stability, performance, developer experience and maintenance.

## Stability

Effector is [renowned for its stability](https://effector.dev/en/core-principles/releases/): major versions are released once a year or even less frequently, any breaking change is preceded by a deprecation warning for at least one year.

All of the libraries in the list are following the same rules of releases as Effector itself (or even stricter).

::: tip
Some of the libraries can be in their `0.x.x` version, but it doesn't mean that they are unstable. It means that the _API is not stabilized yet_, but its soundness is guaranteed and it is safe to use in production. Read the documentation of the library to get more information and make a decision.
:::

## Performance

Effector is small and performant by design. It is a goal of the project to keep the bundle size as small as possible and to make the runtime as fast as possible. Only libraries that keeps in line with this principle are included in the list. They not necessarily should be small, but they should be designed _to be as small as possible_: no unnecessary dependencies, no unnecessary code, tree-shakable, and so on.

## Developer experience

Effector has its unique API approach that is designed to be declarative and easy to work with. The libraries have to follow the spirit of Effector and provide a similar developer experience. They should integrate with Effector seamlessly, provide a clear and concise API aligned with Effector's principles, and provide a [best-in-class TS-support](/statements/typescript).

## Maintenance

We believe that the library should be maintained well. It does not necessarily mean that the library should be updated every day (or should to be updated at all), but it should be maintained — issues should be answered, PRs should be reviewed, and the library should be updated when it is necessary. We do not respect stale-bots and auto-closing issues, we respect the human touch and the human approach to the library.

## Selected libraries

<ul v-for="lib in ecosystem">
  <li><a :href="lib.link">{{ lib.title }}</a>: {{ lib.details }}</li>
</ul>
