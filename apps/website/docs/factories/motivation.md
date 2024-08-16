# Motivation

This library is created to solve two major problems:

1. Controlling that factories are invoked correctly.
2. Marking nested factories as factories.

Let us elaborate on these problems.

## Controlling that factories are invoked correctly

In Effector's ecosystem, all factories [have to be added to the code-transformation plugin's config](https://effector.dev/en/explanation/sids/). But it is really easy to forget to add a factory to the config after creating it. Effector's plugin will not throw an error in this case, but the factory will not work correctly in case of SSR.

In case of using this library, you have to remember only one thing: all factories have to be created using `createFactory` function from `@withease/factories` library. The result of this function is not callable, so you will get an error if you try to invoke it directly.

```js
import { createFactory } from '@withease/factories';

const someFactory = createFactory((arg) => {
  // ...
});

// This will throw an error
const value = someFactory(config);
```

This type of factories can be invoked only by using `invoke` function from `@withease/factories` library. This function accepts a factory and its arguments and returns a result of factory invocation.

```js
import { createFactory, invoke } from '@withease/factories';

const someFactory = createFactory((arg) => {
  // ...
});

const value = invoke(someFactory, config);
```

So, if you add `@withease/factories` to the config of Effector's plugin, you can be sure that all factories are invoked correctly, and you do not have to add them to the config manually.

## Marking nested factories as factories

As you can see in [tests in this PR](https://github.com/effector/effector/pull/938) `effector/babel-plugin` can not mark factories as factories if they are nested in some object exported from a module. It is silently ignored by the plugin because it is nearly impossible to detect such cases automatically based on the code's AST.

However, with this library, you do not have to worry about this problem. All factories created using `createFactory` function and invoked by using `invoke` function will be marked as factories no matter where they are located in the code.
