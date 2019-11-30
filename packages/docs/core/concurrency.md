---
title: Concurrency
---

QIO data structure provide various operators that can help manage concurrency.

## `.and()`

Serial execution of effects can be performed through the `and` operator for eg:

```ts
import {QIO} from '@qio/core'
const putStrLn = QIO.encase(console.log)

const foo = putStrLn('foo')
const bar = putStrLn('bar')

export const main = (): QIO<void, never, unknown> => {
  return foo.and(bar)
}
```

## `.chain()`

Sometimes its necessary to consume the response of the previous result to produce the effect. This can be done using the `chain` operator:

```ts
export const main = (): QIO<void, never, unknown> => {
  return getStrLn('Enter name:').chain(name =>
    putStrLn('Welcome to the world of fp ' + name)
  )
}
```

## `.par()`

Similar to the `and` operator, the `par` operator helps run the two effects in parallel. For eg.:

```ts
import {QIO} from '@qio/core'

const foo = QIO.timeout('foo', 1000)
const bar = QIO.timeout('bar', 1500)

const fooBar = foo.par(bar)
```

The program `fooBar` completes in `1500`ms because both are executed in parallel.

## `.race()`

Race allows two QIO instances to run in parallel and respond with the the one that completes/fails first. The one that is pending automatically gets cancelled.

```ts
import {QIO} from '@qio/core'

const foo = QIO.timeout('foo', 1000)
const bar = QIO.timeout('bar', 1500)

const fooBar = foo.race(bar)
```
