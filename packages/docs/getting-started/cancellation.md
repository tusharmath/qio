---
title: Cancellation
sidebar_label: Cancellation
---

Executing an IO returns a cancel callback. Essentially a function that when called, aborts the IO from any further execution and synchronously releases all the acquired resources.

Create an IO

```diff
+ import {QIO} from '@qio/core'
+ const delayIO = QIO.timeout('Hello World', 1000)
```

Execute by passing it to `defaultRuntime`

```diff
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'
  const delayIO = QIO.timeout('Hello World', 1000)
+ const cancel = defaultRuntime().unsafeExecute(delayIO)
```

Calling the cancelling callback.

```diff
  import {QIO, defaultRuntime} from '@qio/core'
  const delayIO = QIO.timeout('Hello World', 1000)
  const cancel = defaultRuntime().execute(delayIO)
+ cancel()
```

As soon as `cancel` is called internally the timeout is cancelled.
