---
title: Effects
---

Effects are of two types:

1. [Side Effects](#side-effects)
2. [Functional Effects](#functional-effects)

## Side Effects

Side effects are changes that your program performs to the outside world, for eg.:

1. Writing to a database.
2. Taking input from a user.
3. Making an HTTP call.
4. Printing content on the screen, etc.

A program that performs no side-effects has no practical usage. For eg. a program that multiplies two numbers and simply holds the result is pretty much useless, unless the numbers are inputted by the user and the output is printed on the screen.

Side-effects are useful, but they are extremely hard to refactor as we will see:

## Functional Effects

Functional effects are just a representation of a side-effect.
For example we know that making an HTTP call, using `fetch` is a side-effect:

```ts
// Side Effect
const main = () => {
  return fetch('http://www.abc.com')
}
```

Functional Effects we create a data structure that contains an information about the side-effect. For Eg:

```ts
// Functional Effect
const main = () => {
  return {
    type: 'FETCH',
    params: {url: 'http://www.abc.com'}
  }
}
```

This representation of the effect is given to a custom interpreter which then evaluates the above functional effect.

```ts
interpret(main()) // Actually performs the side-effect
```

### QIO DSL

The representation `{type: ... , params: ...}` is a bit too specific to the above use case. QIO provides a more generic DSL that can be used to represent any side effect. For example to convert the `fetch` call into a functional representation you could use `QIO.encaseP`.

```ts
import {QIO} from '@qio/core'

const fetchQ = QIO.encaseP(fetch) // (url: string, init: RequestInit) => QIO<Response>
```

`encaseP` can be used to convert any function that returns a `Promise<A>` to a function that returns a `QIO<A, Error>`.

### QIO Evaluation

Instead of writing a custom interpreter every time, QIO provides a generic interpeter that can evaluate the QIO expression conveniently.

```ts
import {QIO, defaultRuntime} from '@qio/core'

const fetchQ = QIO.encaseP(fetch) // (url: string, init?: RequestInit) => QIO<Response>

defaultRuntime().unsafeExecute(fetchQ('http://www.abc.com'))
```

## Refactoring Capabilities

### Side Effects

Consider the following program:

#### Case 1

```ts
const foo = (n: number): number => {
  const m = n - 1
  console.log(m)
  return m
}

const main = (): number => {
  return foo(10) + foo(10)
}
```

| Behavior | Actual            |
| -------- | ----------------- |
| Return   | `18`              |
| Console  | `9` printed TWICE |

`foo` is called twice inside `main`, thus printing:

#### Case 2 (after refactoring)

```ts
const foo = (n: number): number => {
  const m = n - 1
  console.log(m)
  return m
}

const main = (): number => {
  const bar = foo(10)
  return bar + bar
}
```

| Behavior | Actual           |
| -------- | ---------------- |
| Return   | `18`             |
| Console  | `9` printed ONCE |

The benign refactor has changed the behavior of the program. Earlier the program was printing `9` twice but now it is printing it only once.

### Functional Effects

Using some advanced QIO DSL we can represent the effect caused by `foo` as a functional effect. This effectively makes `foo` return a `QIO<number>` instead of number.

#### Case 1

```ts
import {QIO, defaultRuntime} from '@qio/core'

// Converting impure function to pure
const putStrLn = QIO.encase(console.log)

const foo = (n: number): QIO<number> => {
  return putStrLn(n).const(n - 1)
}

const main = (): QIO<number> => {
  return foo(10)
    .zip(foo(10))
    .map(([a, b]) => a + b)
}

defaultRuntime().unsafeExecute(main())
```

| Behavior | Actual            |
| -------- | ----------------- |
| Return   | `18`              |
| Console  | `9` printed TWICE |

#### Case 2 (after refactoring)

```ts
import {QIO} from '@qio/core'

const putStrLn = QIO.encase(console.log)

const foo = (n: number): QIO<number> => {
  return putStrLn(n).const(n - 1)
}

const main = (): QIO<number> => {
  const bar = foo(10)
  return bar.zip(bar).map(([a, b]) => a + b)
}

defaultRuntime().unsafeExecute(main())
```

| Behavior | Actual            |
| -------- | ----------------- |
| Return   | `18`              |
| Console  | `9` printed TWICE |

Because `foo` is converted to a functional effect, evaluating the program using the runtime will in both cases print `9` twice.
