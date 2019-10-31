---
title: Parallel
---

Similar to the `and` operator, the [par] operator runs the two IOs in parallel. For eg.

[par]: https://tusharmath.com/qio/classes/qio.html#par

Create the two IOs

```ts
+  import {QIO} from '@qio/core'
+
+  const foo = QIO.timeout('foo', 1000)
+  const bar = QIO.timeout('bar', 1500)
```

Combine them using [par]

```ts
  import {QIO} from '@qio/core'

  const foo = QIO.timeout('foo', 1000)
  const bar = QIO.timeout('bar', 1500)

+ const fooBar = foo.par(bar)
```

Execute the created IO

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'

  const foo = QIO.timeout('foo', 1000)
  const bar = QIO.timeout('bar', 1500)

  const fooBar = foo.zip(bar)

+ defaultRuntime().unsafeExecute(fooBar)
```

The program `fooBar` will complete in `1500`ms because both are executed in parallel.

Other more powerful operators can be found at [API Documentation].

[api documentation]: https://tusharmath.com/qio/classes/qio.html
