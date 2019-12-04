---
title: Exception Type
---

Consider a simple deterministic function such as `division` that takes in two numbers and returns the result by dividing one over the other:

```ts
const division = (a: number, b: number): number => {
  return a / b
}
```

The function `division` is defined over a limited set of values for `b`. Passing `b` as `0` will return `Infinity` which is not a `number` thus producing an anomaly in the program at runtime.

## Partial Functions

In functional programming, such functions that are not defined over the complete range of input values, are called as **partial functions**.

## Total Functions

Functions that are defined over the complete range of input values are called as **total functions**.

## Enriching Return Type

Using QIO we can represent the function more clearly:

```ts
class DivisionByZero extends Error {}

const division = (a: number, b: number): QIO<number, DivisionByZero> => {
  return b === 0 ? QIO.reject(new DivisionByZero()) : QIO.resolve(a / b)
}
```

`QIO<number, DivisionByZero>` is a much better representation than just `number`, because it clearly represents how it can succeed and how it can fail.
