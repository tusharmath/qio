---
title: Side Effects
---

Side effects are changes that your program performs to the outside world, for eg.:

1. Writing to a database.
2. Taking input from a user.
3. Making an HTTP call.
4. Printing content on the screen, etc.

A program that performs no side-effects has no practical usage. For eg. a program that multiplies two numbers and simply holds the result is pretty much useless, unless the numbers are inputted by the user and the output is printed on the screen.

## Problems with side-effects

Side-effects are useful, but they are extremely hard to refactor. Consider the following two cases:

### Case 1

```ts
const foo = (n: number): number => {
  // ...
}

const main = (): number => {
  return foo(10) + foo(10)
}
```

`foo` is called twice inside `main`.

### Case 2 (after refactoring)

```ts
const foo = (n: number): number => {
  // ...
}

const main = (): number => {
  const bar = foo(10)
  return bar + bar
}
```

This could be a dangerous change if `foo` causes a side-effect because after the refactor `foo` is called only once which changes the behavior of the program.

## Solving using QIO

Updating `foo` was returning a `QIO<number>` instead of `number` we could do such refactors far more easily.

### Case 1

```ts
import {QIO} from '@qio/core'

const foo = (n: number): QIO<number> => {
  // ...
}

const main = (): QIO<number> => {
  return foo(10).zipWith(foo(10), (a, b) => a + b)
}
```

### Case 2 (after refactoring)

```ts
import {QIO} from '@qio/core'

const main = (): QIO<number> => {
  const bar = foo(10)
  return bar.zipWith(bar, (a, b) => a + b)
}
```

If `foo` was implemented using QIO and instead of returning a `number` it returns `QIO<number>` it can provide guarantees while refactoring.
