---
title: Preferred languages
---

# Preferred languages

Allows tracking user's preferred languages with [_Events_](https://effector.dev/docs/api/effector/event) and [_Stores_](https://effector.dev/docs/api/effector/store).

::: info

Uses [Navigator.languages](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages) and [Window: languagechange event](https://https://developer.mozilla.org/en-US/docs/Web/API/Window/languagechange_event) under the hood under the hood

:::

## Usage

All you need to do is to create an integration by calling `trackPreferredLanguages` with an integration options:

- `setup`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackPreferredLanguages } from '@withease/web-api';

const { $languages, $languages, languageChanged } = trackPreferredLanguages({
  setup: appStarted,
});
```

Returns an object with:

- `$language`: [_Store_](https://effector.dev/docs/api/effector/store) with user's preferred language
- `$languages`: [_Store_](https://effector.dev/docs/api/effector/store) with array of user's preferred languages sorted by priority
- `languageChanged`: [_Event_](https://effector.dev/docs/api/effector/event) that fires on preferred language change

::: tip
It supports [`@@trigger` protocol](/protocols/trigger). Since it allows firing only one [_Event_](https://effector.dev/docs/api/effector/event) `trackPreferredLanguages` triggers `languageChanged` as a `fired` in case of [`@@trigger` protocol](/protocols/trigger).

```ts
import { trackPreferredLanguages } from '@withease/web-api';

somethingExpectsTrigger(trackPreferredLanguages);
```

:::

## Live demo

Let us show you a live demo of how it works. The following demo displays a `$languages` value. _Change your system or browser language to see how it works._

<script setup lang="ts">
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition'

import { trackPreferredLanguages } from '../../../../packages/web-api';

const appStarted = createEvent();

const { $languages } = trackPreferredLanguages(
  { setup: appStarted }
);

const languages = useStore($languages)

appStarted();

</script>

::: details Source code

```ts
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition';
import { trackPreferredLanguages } from '@withease/web-api';

const appStarted = createEvent();

const { $languages } = trackPreferredLanguages({ setup: appStarted });

const languages = useStore($languages);

appStarted();
```

:::

User's preferred languages:

<ol>
  <li v-for="lang in languages">{{ lang }}</li>
</ol>

## Service-side rendering (SSR)

It uses browser's APIs like `window.addEventListener` and `navigator.languages` under the hood, which are not available in server-side environment. However, it is possible to use it while SSR by passing header `Accept-Language` from the user's request to the special [_Store_](https://effector.dev/docs/api/effector/store) `trackPreferredLanguages.$acceptLanguageHeader` while `fork` in the server-side environment. Every server-side framework has its own way to do it, there are some examples:

::: details Fastify

```ts
// server.ts
import { trackPreferredLanguages } from '@withease/web-api';

fastify.get('*', {
  async handler(request, reply) {
    const scope = fork({
      values: [
        [
          trackPreferredLanguages.$acceptLanguageHeader,
          request.headers['Accept-Language'],
        ],
      ],
    });

    await allSettled(appStarted);

    // render HTML and return it

    return reply.send(html);
  },
});
```

:::

::: details Express

```ts
// server.ts
import { trackPreferredLanguages } from '@withease/web-api';

app.get('*', (req, res) => {
  const scope = fork({
    values: [
      [
        trackPreferredLanguages.$acceptLanguageHeader,
        req.get('Accept-Language'),
      ],
    ],
  });

  allSettled(appStarted)
    .then(() => {
      // render HTML and return it
      return html;
    })
    .then((html) => {
      res.send(html);
    });
});
```

:::

::: details Next.js

```ts
// server.ts
import { trackPreferredLanguages } from '@withease/web-api';

@Controller()
export class SSRController {
  @Get('*')
  async render(@Headers('Accept-Language') acceptLanguageHeader: string) {
    const scope = fork({
      values: [
        [trackPreferredLanguages.$acceptLanguageHeader, acceptLanguageHeader],
      ],
    });

    await allSettled(appStarted);

    // render HTML and return it

    return html;
  }
}
```

:::
