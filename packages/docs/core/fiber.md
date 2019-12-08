---
title: Fiber
---

The `Fiber` API provides low level concurrency handles, that helps in writing **asynchronous** programs which can be **paused** or **aborted**.

`Fiber` is represented with two type params viz.

1. `A` The type of the success value that will be emitted once the Fiber is completely evaluated.
2. `E` The error type that can be emitted in case of failure.

```ts
interface Fiber<A, E> {
  join: QIO<A, E>
  abort: QIO<void>
}
```

## Use case

Consider running the following `program`:

```ts
import {QIO} from '@qio/core'

const putStrLn = QIO.encase(console.log)

const A = putStrLn('A').delay(1000) // QIO<string>
const B = putStrLn('B') // QIO<string>

const program = A.and(B)
```

**Output**

```bash
A
B
```

`A` is printed first and then `B` is printed. This guarantee is provided by the `and` operator.

To make sure that the computation continues with `B` and doesn't wait for `A` to complete we can use the `fork()` operator on `A`.

```diff
  import {QIO} from '@qio/core'

  const putStrLn = QIO.encase(console.log)

- const A = putStrLn('A').delay(1000) // QIO<string>
+ const A = putStrLn('A').delay(1000).fork() // QIO<Fiber<string>>
  const B = putStrLn('B') // QIO<string>

  const program = A.and(B)
```

**Output**

```bash
B
A
```

Calling `fork()` makes sure that `A` runs in its own Fiber, asynchronously and moves on to computing `B` as soon as possible. That way `B` is printed first and then after `1000ms`, `A` is printed.

### `F.abort`

```diff
  import {QIO} from '@qio/core'

  const putStrLn = QIO.encase(console.log)

- const A = putStrLn('A').delay(1000).fork()
+ const A = putStrLn('A').delay(1000).fork().chain(F => F.abort.delay(100))
  const B = putStrLn('B')

  const program = A.and(B)
```

**Output:**

```bash
B
```

`F` represents a `Fiber` and using `abort.delay(100)` we are aborting the computation after `100ms` that way `A` is never computed and thus only `B` is printed on the screen.

### `F.join`

```diff
  import {QIO} from '@qio/core'

  const putStrLn = QIO.encase(console.log)

- const A = putStrLn('A').delay(1000).fork().chain(F => F.abort.delay(100))
+ const A = putStrLn('A').delay(1000).fork().chain(F => F.join)
  const B = putStrLn('B')

  const program = A.and(B)
```

**Output:**

```bash
A
B
```

`F.join` waits for the fiber to compute its value and move on to the next. In the above case `A` is printed after `1000ms` and then immediately `B` is printed.

Once the fiber is computed internally, using `join` multiple times will resolve with the same cached, value every time.
