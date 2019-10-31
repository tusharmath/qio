---
title: Executing a QIO
---

Execution of QIO happens through a [Runtime].

[runtime]: https://tusharmath.com/qio/classes/runtime.html

```ts
import {QIO, defaultRuntime} from '@qio/core'

const putStrLn = QIO.encase(console.log)
const greet = putStrLn('Hello World!')

defaultRuntime.unsafeExecute(greet)
```
