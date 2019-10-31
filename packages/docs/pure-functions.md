---
title: Pure Functions
---

A recap of what we have learnt so far —

1. **Effect Free:** The function never performs changes to the outside world.
2. **Deterministic:** Given the same input, a pure function will always return the same output.
3. **Total:** It is defined over the complete set of possible input values (doesn't throw exceptions or produce an anomaly).

In functional programing functions that are **effect-free**, **deterministic** & **total** are called as **pure functions**.

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

## Credits

QIO is heavily inspired by the following libraries —

- [Scala ZIO](https://github.com/zio/zio)
- [Fluture](https://github.com/fluture-js/Fluture)
