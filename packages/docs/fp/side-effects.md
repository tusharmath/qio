---
title: Side-effects
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

`foo` is assigned to a variable and is effectively called only once.

This is a very common refactor, where a function call is assigned to a variable and then used. These kind of refactors can change the behavior of the `main` program if `foo` causes a side-effect.

For example if `foo` updates a global counter then the `main` function will update the counter only **once** in case 1 and **twice** in case 2.

## Solving using QIO

If `foo` was returning a `QIO<number>` instead of `number` we could do such refactors far more easily.

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
