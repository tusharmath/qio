---
title: Executing a QIO
sidebar_label: Executing a QIO
---

Execution of QIO happens through a [Runtime].

[runtime]: https://tusharmath.com/qio/classes/runtime.html

```diff
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'

  const Greet = () => console.log('Hello World!')
  const GreetIO = QIO.encase(Greet)
+ defaultRuntime().unsafeExecute(GreetIO())
```
