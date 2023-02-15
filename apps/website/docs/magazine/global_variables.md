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

As you can see, in 3/4 of environments we have more than one instance of our application in a single process. It means that we can't use global variables to store our application state. It's not safe. Let's see how we can solve this problem.

## React-way

React-way is to use [React Context](https://reactjs.org/docs/context.html) to store our application state.

::: tip
React used as an example, but almost all frontend frameworks have similar concepts.
:::

We can use a value from a context 👇

```tsx
// app.tsx
function App() {
  const userId = useContext(UserIdContext);

  return (
    <main>
      <h1>Hello, world!</h1>
      <p>{currentValue}</p>
    </main>
  );
}
```

And pass it in particular environment independently through a context provider 👇

::: code-group

```tsx [client.entrypoint.tsx]
import { createRoot } from "react-dom/client";

// In client-side environment we can read a value from a browser
createRoot(document.getElementById("root")).render(
  <UserIdContext.Provider value={readUserIdFromBrowser()}>
    <App />
  </UserIdContext.Provider>
);
```

```tsx [server.tsx]
import { renderToString } from "react-dom/server";

function handleRequest(req, res) {
  // In server-side environment we can read a value from a request
  const html = renderToString(
    <UserIdContext.Provider value={readUserIdFromRequest(req)}>
      <App />
    </UserIdContext.Provider>
  );

  res.send(html);
}
```

```tsx [app.test.tsx]
import { render } from "@testing-library/react";

describe("App", () => {
  it("should render userId", () => {
    // In test environment we can use a mock value
    const { getByText } = render(
      <UserIdContext.Provider value={"42"}>
        <App />
      </UserIdContext.Provider>
    );

    expect(getByText("42")).toBeInTheDocument();
  });
});
```

```tsx [app.stories.tsx]
export default {
  component: App,
  title: "Any random title",
};

export const Default = () => {
  // In Storybook environment we can use a mock value as well
  return (
    <UserIdContext.Provider value={"mockUserId"}>
      <App />
    </UserIdContext.Provider>
  );
};
```

:::

Now, it is bulletproof. We can render any amount of instances of our application in a single process, and they will not interfere with each other. It's a good solution, but it's not suitable for non-React contexts (like business logic layer). Let's see how we can solve this problem with Effector.

## Effector-way

Effector has its own API to isolate application state, it's called Fork API — [`fork`](https://effector.dev/docs/api/effector/fork) function returns a new [_Scope_](https://effector.dev/docs/api/effector/scope) which is a container for all application state. Let's see how we can use it in all mentioned environments.

Let's save a user id in a [_Store_](https://effector.dev/docs/api/effector/store) 👇

```ts
// app.ts
import { createStore } from "effector";

const $userId = createStore(null);
```

Later we can replace a value in a [_Store_](https://effector.dev/docs/api/effector/store) during `fork` call 👇

::: code-group

```ts [client.entrypoint.ts]
import { fork } from "effector";

// In client-side environment we can read a value from a browser
const scope = fork({ values: [[$userId, readUserIdFromBrowser()]] });
```

```tsx [server.tsx]
import { fork } from "effector";

function handleRequest(req, res) {
  // In server-side environment we can read a value from a request
  const scope = fork({ values: [[$userId, readUserIdFromRequest(req)]] });

  // ...
}
```

```tsx [app.test.tsx]
import { fork } from "effector";

describe("App", () => {
  it("should pass userId", () => {
    // In test environment we can use a mock value
    const scope = fork({ values: [[$userId, "42"]] });

    expect(scope.getState($userId)).toBe("42");
  });
});
```

:::
