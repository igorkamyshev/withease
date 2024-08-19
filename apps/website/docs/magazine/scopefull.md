---
title: Catch Scope-less Calls
date: 2024-08-20
---

# Catch Scope-less Calls

[Fork API](https://effector.dev/en/api/effector/fork/) is an Effector's killer feature. It allows you to execute any number of application instances in parallel in a single thread which is great for testing and SSR. Fork API has [some rules](/magazine/fork_api_rules) to follow and this article is about automated validation of them.

## The Problem

Some violations of the Fork API rules can be detected by static analysis tools like ESLint with the [effector/scope](https://eslint.effector.dev/presets/scope.html) preset. But some rules require runtime validation. For example, it is illegal to make an imperative call of an [_Event_](https://effector.dev/en/api/effector/event/) with no explicit [_Scope_](https://effector.dev/docs/api/effector/scope). However, for ESLint it is almost impossible to detect such calls.

In this case we need to listen to all messages that pass through Effector's kernel and analyze them. If we find a message with no [_Scope_](https://effector.dev/docs/api/effector/scope) we can log it.

## The Preparation

Effector has a special API to listen messages that pass through the library. It is called [Inspect API](https://effector.dev/en/api/effector/inspect/). You can use it to catch all messages and analyze them. This API is great for debugging and testing which is what we need.

The usage of the Inspect API is quite simple. You need to call the `inspect` function with a callback that will be called for each message. The callback will receive a message object that contains all the information about the message. You can analyze this object and do whatever you want.

```ts
import { inspect, Message } from 'effector/inspect';

inspect({
  /**
   * Explicitly define that we will
   * catch only messages where Scope is undefined
   */
  scope: undefined,
  fn: (m: Message) => {
    const name = `${m.kind} ${m.name}`;
    const error = new Error(`${name} is not bound to scope`);

    console.error(error);
  },
});
```
