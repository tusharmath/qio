---
title: Exception & Anomalies
---

Consider a simple deterministic function such as `division` that takes in two numbers and returns the result by dividing one over the other:

```ts
const division = (a: number, b: number): number => {
  return a / b
}
```

If you observe closely you will see a problem with `division`. The function `division` is defined over a limited set of values for `b`. Passing `b` as `0` will return `Infinity` which is technically not a `number` thus producing an anomaly in the program at runtime. Ideally you would like to handle the above problem at compile time.

## Partial Functions

In functional programming, such functions that are not defined over the complete range of input values, are called as **partial functions**.

## Total Functions

Functions that are defined over the complete range of input values are called as **total functions**.

## Improving Return Types

To make the above `division` function **total**, we can use an `Either` data structure to represent the function's return type more clearly.

```ts
class Left<L> {
  constructor(readonly value: L) {}
}

class Right<R> {
  constructor(readonly value: R) {}
}

type Either<L, R> = Left<L> | Right<A>
```

And update the return type with `Either<DivisionByZero, number>`. This means that the return value of the function is either a failure of type `DivisionByZero` or a success of type `number`.

```ts
class DivisionByZero extends Error {}

const division = (a: number, b: number): Either<DivisionByZero, number> => {
  return b === 0 ? new Left(new DivisionByZero()) : new Right(a / b)
}
```
