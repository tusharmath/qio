---
title: Introduction
---

QIO is a library that solve practical problems of effectful code.

## Usage

```typescript
import {IO, defaultRuntime} from '@qio/core'

// Create a pure version of `console.log` called `putStrLn`
const putStrLn = IO.encase((str: string) => console.log(str))

const hello = putStrLn('Hello World!')

const runtime = defaultRuntime()
runtime.unsafeExecute(hello)
```

## Type Signature

```ts
interface QIO<R, E, A> {
  // ... Operators
}
```

`QIO` takes in three type params viz. —

1. `R` Represents the type of environment needed to execute this IO ([more](#custom-environment)).
2. `E` The error types that can be emitted while this IO is executing.
3. `A` The type of the success value that will be emitted by the IO on completion.

Using these three type params you can fairly represent any side-effect. For example lets say there is function `Greet` which simply prints "Hello World" —

```diff
  const Greet = () => console.log('Hello World!')
```

To represent `Greet` —

1. `R` could be `unknown`: since `console.log` works everywhere.
2. `E` could be `never`: Printing anything on console never fails.
3. `A` could be `void`: The output of running the program is basically nothing.

```ts
const GreetIO: QIO<unknown, never, void>
```

# Credits

QIO is heavily inspired by the following libraries —

- [Scala ZIO](https://github.com/zio/zio)
- [Fluture](https://github.com/fluture-js/Fluture)
