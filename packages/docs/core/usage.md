---
title: Usage
sidebar_label: Usage
---

[concepts]: ../concepts/introduction

QIO is merely a data structure that represents a side-effect. It doesn't actually perform the side effect itself. The effect is performed by the QIO Runtime lazily. It helps convert **impure functions** to **pure functions**.

`QIO` uses three type params to represent an effect safely:

```ts
interface QIO<A, E, R> {
  // ...
}
```

| Parameter |                                                                             |
| :-------: | --------------------------------------------------------------------------- |
|    `A`    | The type of the success value that will be emitted by the IO on completion. |
|    `E`    | The error types that can be emitted while this IO is executing.             |
|    `R`    | Represents the type of environment needed to execute this IO.               |

Using these three type params you can fairly represent any side-effect. For eg. consider `console.log`

```ts
const greet = () => console.log('Hello World!') // void
```

`greet` can be represented using QIO as:

```ts
import {QIO} from '@qio/core'

const greetIO = QIO.lift(greet) // QIO<never, void, unknown>
```

| Parameter | Value     |                                               |
| --------- | --------- | --------------------------------------------- |
| `A`       | `void`    | The output of running the program is nothing. |
| `E`       | `never`   | Printing anything on console never fails.     |
| `R`       | `unknown` | since `console.log` works everywhere.         |

## Creating a QIO

There are multiple ways through which you can create an instance of QIO.

[api documentation]: api/classes/qio.md

One of the easiest ways to create a QIO is through [QIO.encase].

[qio.encase]: api/classes/qio.md#encase

```ts
+ import {QIO} from '@qio/core'
+
+ const putStrLn = QIO.encase(console.log)
+ const greet = putStrLn('Hello World')
```

`greet` returns a pure data structure of the type `QIO<void, never, unknown>` which represents a side-effect, that:

1. Resolves with a value of type _void_.
2. It _never_ fails.
3. Can execute in any _unknown_ environment.

## Executing QIO

Execution of QIO happens through a [Runtime].

[runtime]: ../api/globals#const-defaultruntime

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'

  const putStrLn = QIO.encase(console.log)
  const greet = putStrLn('Hello World')
+ defaultRuntime().unsafeExecute(greet)
```
