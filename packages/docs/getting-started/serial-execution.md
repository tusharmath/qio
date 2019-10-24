---
title: Serial Execution
sidebar_label: Serial Execution
---

Since these data structures don't specify how or when they are going to be executed, writing them one after the other in procedural style will not guarantee any order of execution, for Eg —

```diff
+  import {QIO} from '@qio/core'
+  const putStrLn = QIO.encase((msg: string) => console.log(msg))
+
+  const foo = putStrLn('foo')
+  const bar = putStrLn('bar')
```

In the above code either `foo` or `bar` can be printed first depending on internal prioritization and scheduling algorithms that QIO uses. To ensure that `foo` is printed first and `bar` is printed second one must use the [and] operator.

```diff
  import {QIO} from '@qio/core'
  const putStrLn = QIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

+ const fooBar = fooIO.and(barIO)
```

`fooBar` is a new QIO object of type `QIO<unknown, never, void>`.

```diff
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'
  const putStrLn = QIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

  const fooBar = fooIO.and(barIO)
+ defaultRuntime().unsafeExecute(fooBar)
```

[and]: https://tusharmath.com/qio/classes/qio.html#and
