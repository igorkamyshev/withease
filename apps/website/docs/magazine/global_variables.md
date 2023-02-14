# Global variables and frontend

What problems do we have with the following code?

```js
axios.interceptors.request.use(
  function (config) {
    config.headers['X-Custom-Token': getTokenSomehow()];

    return config;
  }
);
```

So, it's quite a lot, but let's focus on the global variable `axios` and it's operations.

::: tip TL;DR
It causes possible mixing between different users during SSR, make tests slower and stories harder to write.
:::

In the modern world our frontend applications can run in different environments:

- browser as a standalone application
- browser as a part of a bigger application (e.g. in [Storybook](https://storybook.js.org/))
- Node.js as a test-case
- Node.js as a server-side rendering application

As you can see, in 3/4 of environments we have more than one instance of our application in a single process.
