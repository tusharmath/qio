---
title: Non Determinism
---

Another typical problem that a real world program needs to deal with is non-determinism. When the giving the same input to a program produces different results, its called as non-determinism, for eg:

```ts
const elapsedTime = (dob: Date): number => {
  const today = new Date()
  return today.getTime() - dob.getTime()
}
```

The function `calculateAge` when given the same input will produce different results as time passes. The program doesn't cause any [side-effects] but is non-deterministic.

[side-effects]: side-effects

## Problems

The problem with non-deterministic functions is that they are extremely hard to test. For eg. to test `elapsedTime` we would need to inject the today's date from outside:

```ts
const elapsedTime = (dob: Date, today: Date): number => {
  return today.getTime() - dob.getTime()
}
```

This solves the problem locally but it also shifts it up to its caller:

```ts
const elapsedTime = (dob: Date, today: Date): number => {
  return today.getTime() - dob.getTime()
}

const main = (today: Date): number => {
  const dob = new Date(1980, 1, 1)
  return elapsedTime(dob, today)
}
```

This isn't scalable because as more dependencies are added or removed, every function between the consumer of the dependency and the root function will have change their signature.

```ts
const foo = (math: Math): number => {
  // ...
}

const main = (today: Date, math: Math): number => {
  const dob = new Date(1980, 1, 1)
  const bar = foo(math)
  return elapsedTime(dob, today) + bar
}
```

## Solving using QIO

Using QIO, we can solve this problem in a more manageable way.

### Define Environment Dependencies

First we create wrapper types on top of each dependency. It's a simple interface that will provide access to those environments.

```ts
interface DateEnv = {
  Date: Date
}

interface MathEnv = {
  Math: Math
}
```

### Access the environment

We change the implementation for `elapsedTime` to use the `DateEnv`:

```ts
const elapsedTime = (dob: Date): QIO<number, never, DateEnv> => {
  return QIO.access((_: DateEnv) => _.Date().getTime() - dob)
}

const foo = (): QIO<number, never, MathEnv> => {
  // ...
}
```

The return type of both the functions now contain information about the specific environment they need.

### Composing the environment

```ts
const main = (): QIO<number, never, DateEnv & MathEnv> => {
  const dob = new Date(1980, 1, 1)

  return elapsedTime(dob).zipWith(foo(), (a, b) => a + b)
}
```

Combining `elapsedTime` with `foo` using the `zipWith` operator ensure that the final environment that is needed is of the type of `DateEnv & MathEnv`.

Adding more external environment dependencies doesn't require you to change the signature of function arguments.

QIO will automatically compose these environments for you so that you can provide it the final env at the time of evaluation.

```ts
main() // QIO<number, never, DateEnv & MathEnv>
main().provide({Math, Date}) // QIO<number>
```
