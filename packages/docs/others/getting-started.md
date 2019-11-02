---
title: Getting Started
---

A _real world_ program needs to deal with **side-effects**, **non determinism** and **exceptions**. **QIO** provides a set of solid type-safe abstractions that can help solve these problems elegantly.

Next we will try to understand these concepts in more detail. If you know these concepts already you can directly skip to the [tutorial].

[tutorial]: /qio/web/docs/installation

## Side Effects

Side effects are changes that your program performs to the outside world, for eg.:

1. Writing to a database.
2. Taking input from a user.
3. Making an HTTP call.
4. Printing text on the screen etc.

A program that performs no side-effects has no practical usage. For eg. a program that multiplies two numbers and simply holds the result is pretty much useless, unless the numbers are inputted by the user and the output is printed on the screen.

### Problems

Side-effects are needed, but they suffer from a major drawback. If your code performs any kind of side-effect then the behavior of the program is dependent on how your code is structured. For Eg:

#### Case 1:

```ts
const program = fetch('/pqr').then(() => fetch('/abc')) // Promise<Response>
```

> Learn more about the [fetch] API.

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

#### Case 2:

```ts
const abc = fetch('/abc')
const program = fetch('/pqr').then(() => abc) // Promise<Response>
```

In case 1 the call to `abc` and `pqr` happen one after the other. In case 2 however, the call goes to both the urls simultaneously, without giving any explicit instructions. The only difference in case 2 is that promise created by `fetch('/abc')` is assigned to a variable (a very common refactor) and moved out of the closure.

Now consider a similar case with an effect free function such as the `map` function on an `Array`:

#### Case 1:

```ts
const program = [0, 1].map(() => [100, 110].map(i => i + 1)) // [[101, 111], [101, 111]]
```

#### Case 2:

```ts
const x = [100, 110].map(i => i + 1)
const program = [(0, 1)].map(() => x) // [[101, 111], [101, 111]]
```

In both the cases, because `map` is a pure function the behavior of `program` remains unchanged even after restructuring the code a bit.

### Solving using QIO

With QIO one can get similar guarantees even from an effect-ful function, for Eg:

#### Case 1:

```ts
import {QIO} from '@qio/core'

const fetchQ = QIO.encaseP(fetch)
const program = fetchQ('/pqr').chain(() => fetchQ('/abc')) // QIO<Error, Response, unknown>
```

There are multiple things happening above:

1. `QIO.encaseP` wraps any promise returning function and return a new QIO returning function.
2. The returned function `fetchQ`, when called doesn't actually make any HTTP calls. It just creates a data structure of the form `QIO<Error, Response, unknown>` which represents the fact that there will be an HTTP call that might fail with an `Error` or succeed with a `Response` and can run in any `unknown` environment (more on this later).
3. Instead of using `then` QIO provide a special operator `chain` to sequence things one after the other.

Now lets consider the case 2:

#### Case 2:

```ts
import {QIO} from '@qio/core'

const fetchQ = QIO.encaseP(fetch)
const abc = fetchQ('/abc')
const program = fetchQ('/pqr').chain(() => abc) // QIO<Error, Response, unknown>
```

Moving the `abc` call out of the `chain` method's callback has no impact of the behavior of the program.

#### Running the program

To actually run the program one needs to use a runtime

```ts
import {QIO, defaultRuntime} from '@qio/core'

const fetchQ = QIO.encaseP(fetch)
const abc = fetchQ('/abc')
const program = fetchQ('/pqr').chain(() => abc) // QIO<Error, Response, unknown>

defaultRuntime().unsafeExecute(program)
```

## Non Determinism

Another typical problem that a real world program needs to deal with is non-determinism. Consider a program that reads a user's account balance from the database and prints it on the screen. If anyone changes the user's account balance later in time, running program again would print the updated balance.

This is non-determinism and is typically caused when your program tries to read a globally mutable state. Such non-deterministic programs can induce race conditions very easily and deter developers from using any form of [memoization].

[memoization]: https://en.wikipedia.org/wiki/Memoization

Now consider a simple division function, passing the same two numbers as input will always return the same result. Such a function is going to be deterministic, hence it's not affected by concurrent execution and is easily memoizable.

```ts
const division = (a: number, b: number): number => a * b
```

## Exception & Anomalies

Consider a simple deterministic function such as `division` that takes in two numbers and returns the result by dividing one over the other:

```ts
const division = (a: number, b: number): number => {
  return a / b
}
```

If you observe closely you will see a problem with `division`. The function `division` is defined over a limited set of values for `b`. Passing `b` as `0` will return `Infinity` which is technically not a `number` thus producing an anomaly in the program at runtime. Ideally you would like to handle the above problem at compile time.

### Partial Functions

In functional programming, such functions that are not defined over the complete range of input values, are called as **partial functions**.

### Total Functions

Functions that are defined over the complete range of input values are called as **total functions**.

To make the above `division` function **total**, we can use QIO.

### Solving using QIO

```ts
import {QIO} from '@qio/core'

class DivisionByZero extends Error {}

const division = (a: number, b: number): QIO<DivisionByZero, number> => {
  return b === 0 ? QIO.reject(new DivisionByZero()) : QIO.of(a / b)
}
```

Updating the return type with `QIO<DivisionByZero, number>` means that the return value of the function is either a failure of type `DivisionByZero` or a success of type `number`.

## Pure Functions

In functional programing functions that are **effect-free**, **deterministic** & **total** are called as **pure functions**:

1. **Effect Free:** The function never performs any changes to the outside world (no side-effects).
2. **Deterministic:** Given the same input, the function will always return the same output.
3. **Total:** The function is defined over the complete set of possible input values & doesn't ever throw exceptions or produce an anomaly.

## Referential Transparency

Pure functions are referentially transparent. This means in a program the function calls may be replaced by its value (or anything having the same value) without changing the behavior of the program.

This is a powerful guarantee which allows devs to refactor code much more easily.

---

Continue reading the [tutorial](../core/installation) to understand how QIO can be used to solve these problems.
