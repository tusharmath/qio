---
title: Multitasking
---

QIO can evaluate multiple CPU intensive expressions in parallel. For eg consider the following fibonacci implementation:

```diff
+ import {QIO} from '@qio/core'
+
+ const fib = QIO.lazy(
+   (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
+     if (a <= 2n) {
+       return QIO.resolve(l + r)
+     }
+
+     return fib(a - 1n, r, l + r)
+   }
+ )
```

## zip `fib(10_000n)` with `fib(100n)`

```diff
  import {QIO} from '@qio/core'

  const fib = QIO.lazy(
    (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
      if (a <= 2n) {
        return QIO.resolve(l + r)
      }

      return fib(a - 1n, r, l + r)
    }
  )
+
+ const fib_10K = fib(10_000n)
+ const fib_10 = fib(10n)
+
+ const program = fib_10K.zip(fib_10)
```

Zipping `fib_10K` with `fib_10` will make sure that first `fib_10K` is computed and then `fib_10` is computed. In other words the computation of `fib_10` is blocked until `fib_10K` is completed.

## Unblock `fib_10`

We can offload the computation to their own independent fibers so that they can run independently using `fork()`.

```diff
  import {QIO} from '@qio/core'

  const fib = QIO.lazy(
    (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
      if (a <= 2n) {
        return QIO.resolve(l + r)
      }

      return fib(a - 1n, r, l + r)
    }
  )

- const fib_1K = fib(1_000n)
+ const fib_1K = fib(1_000n).fork()
- const fib_10 = fib(10n)
+ const fib_10 = fib(10n).fork()

  const program = fib_1K.zip(fib_10)
```

## Passing `FiberConfig`

Passing an additional `FiberConfig` will allow QIO to switch from one computation to another, after some time has passed.

```diff
- import {QIO} from '@qio/core'
+ import {QIO, FiberConfig} from '@qio/core'

  const fib = QIO.lazy(
    (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
      if (a <= 2n) {
        return QIO.resolve(l + r)
      }

      return fib(a - 1n, r, l + r)
    }
  )

- const fib_1K = fib(1_000n).fork()
+ const fib_1K = fib(1_000n).fork(FiberConfig.MAX_DURATION(10))
- const fib_10 = fib(10n).fork()
+ const fib_10 = fib(10n).fork(FiberConfig.MAX_DURATION(10))

  const program = fib_1K.zip(fib_10)
```

Passing `FiberConfig.MAX_DURATION(10)` configures the `Fiber` to only run for `10ms` and then perform a switch to some other `Fiber`. Passing the configuration parameter will make sure that `fib_10` actually always finishes first.

## Default Config

You can change the default `Fiber` creation config of the program by passing it in the end.

```diff
  import {QIO, FiberConfig} from '@qio/core'

  const fib = QIO.lazy(
    (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
      if (a <= 2n) {
        return QIO.resolve(l + r)
      }

      return fib(a - 1n, r, l + r)
    }
  )

- const fib_1K = fib(1_000n).fork(FiberConfig.MAX_DURATION(10))
+ const fib_1K = fib(1_000n).fork()
- const fib_10 = fib(10n).fork(FiberConfig.MAX_DURATION(10))
+ const fib_10 = fib(10n).fork()

- const program = fib_1K.zip(fib_10)
+ const program = fib_1K.zip(fib_10).fork(FiberConfig.MAX_DURATION(10))
```

Passing the config as `FiberConfig.MAX_DURATION(10)` automatically gets forwarded to every `fork` call unless overridden explicitly.

## Concurrent Running

```diff
- import {QIO, FiberConfig} from '@qio/core'
+ import {QIO, FiberConfig, defaultRuntime} from '@qio/core'

  const fib = QIO.lazy(
    (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
      if (a <= 2n) {
        return QIO.resolve(l + r)
      }

      return fib(a - 1n, r, l + r)
    }
  )

  const fib_1K = fib(1_000n).fork()
  const fib_10 = fib(10n).fork()

  const program = fib_1K.zip(fib_10).fork(FiberConfig.MAX_DURATION(10))
+
+ defaultRuntime().unsafeExecute(program)
```

## Final Program

```ts
import {QIO, FiberConfig} from '@qio/core'
import {QIO, FiberConfig, defaultRuntime} from '@qio/core'

const fib = QIO.lazy(
  (a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
    if (a <= 2n) {
      return QIO.resolve(l + r)
    }

    return fib(a - 1n, r, l + r)
  }
)

const fib_1K = fib(1_000n).fork()
const fib_10 = fib(10n).fork()

const program = fib_1K.zip(fib_10).fork(FiberConfig.MAX_DURATION(10))

defaultRuntime().unsafeExecute(program)
```

This way multiple CPU bound computations can be executed concurrently.
