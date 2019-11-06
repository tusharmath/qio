---
title: Type Signature
---

```ts
interface QIO<A, E, R> {
  // ... Operators
}
```

`QIO` takes in three type params viz. —

1. `A` The type of the success value that will be emitted by the IO on completion.
2. `E` The error types that can be emitted while this IO is executing.
3. `R` Represents the type of environment needed to execute this IO.

Using these three type params you can fairly represent any side-effect. For example lets say there is function `Greet` which simply prints "Hello World" —

```ts
const Greet = () => console.log('Hello World!')
```

To represent `Greet` —

1. `A` could be `void`: The output of running the program is empty.
2. `E` could be `never`: Printing anything on console never fails.
3. `R` could be `unknown`: since `console.log` works everywhere.

```ts
const GreetIO = Greet() // QIO<never, void, unknown>
```
