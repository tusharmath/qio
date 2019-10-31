---
title: Usage
sidebar_label: Usage
---

There are multiple ways through which you can create an instance of QIO viz. Refer to the [API documentation] to learn about all the ways.

[api documentation]: /web/docs/api/globals

One of the easiest ways to create a QIO is through [QIO.encase].

[qio.encase]: /web/docs/api/classes/qio#encase

```ts
import {QIO} from '@qio/core'

// Converts an impure function to a pure one
const putStrLn = QIO.encase(console.log)

// Creates a new QIO data structure
const greet = putStrLn('Hello World')
```

Here `putStrLn` is a pure implementation of `console.log`. Calling the function doesn't actually print on the screen rather, it creates a data structure of type `QIO<never, void, unknown>` which is then assigned to the `greet` variable.
