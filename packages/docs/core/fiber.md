---
title: Fiber
---

Fiber provides a low level API to manage the execution of any QIO expression. It can be accessed via the `fork` operator which is available on all QIO instances.

```ts
const program = QIO.resolve(1000)
  .fork()
  .chain(F => F.abort)
```

The value `F` is an instance of `Fiber`.

## API

A Fiber takes in two type params viz.

1. `A` The type of the success value that will be emitted once the Fiber is completely evaluated.
2. `E` The error type that can be emitted in case of failure.

```ts
interface Fiber<A, E> {
  join: QIO<A, E>
  abort: QIO<void>
}
```

### `F.abort`

The `abort` operator allows us to cancel the execution in a purely functional manner. A more reasonable use case would be to timeout an HTTP request.

```ts
import {QIO} from '@qio/core'
import {request} from '@qio/http'

const putStrLn = QIO.encase(console.log)
const program = request({url: 'http://www.abc.com'})
  .chain(putStrLn)
  .fork()
  .chain(F => F.abort.delay(1000))

defaultRuntime().unsafeExecute(program)
```

Here the `program` tries to make an HTTP request to `abc.com` and if the response is not received within `1000ms`, the request is safely aborted.

### `F.join`

The `join` operator waits for the execution to complete and resolves with either a success or a failure value. A typical use case for this could be to run two QIO instances in parallel.

```ts
import {QIO} from '@qio/core'

const L = QIO.timeout('L', 1000).fork()
const R = QIO.timeout('R', 2000).fork()

const program = L.zip(R).chain(([FL, FR]) => {
  return FL.join.zip(FR.join)
})

defaultRuntime().unsafeExecute(program) // QIO<[string, string]>
```

`FL` and `FR` are the two fibers that are created for `L` and `R` respectively. As soon as they are created, the computation for the two timeouts being in parallel. Using the `join` operator, we later wait for each of them to finish and return a `[string, string]`.
