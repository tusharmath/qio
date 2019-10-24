---
title: Creating a QIO
sidebar_label: Create
---

There are multiple ways through which you can create an instance of QIO viz. `QIO.from` or `QIO.encase` etc. Refer to the [API documentation] to learn about all the ways.

[api documentation]: https://tusharmath.com/qio/classes/qio.html

Once of the easiest ways to create a QIO is through [QIO.encase].

[qio.encase]: https://tusharmath.com/qio/classes/qio.html#encase

```patch
+ import {QIO} from '@qio/core'

  const Greet = () => console.log('Hello World!')
+ const GreetIO = QIO.encase(Greet)
```

Calling `GreetIO()` returns a pure data structure which represents a side-effect, that —

1. Can execute in any environment without any special needs.
2. Never fails.
3. Resolves with a `void`.
