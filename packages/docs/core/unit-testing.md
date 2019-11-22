---
title: Unit Testing
---

QIO aims at solving the practical problems of effectful programs. One of the problems is being able to write testable programs, for eg:

```diff
+ const foo = (a: number, b: number): number => {
+   return d1(a) + d2(b)
+ }
```

`d1` and `d2` are external effectful dependencies that `foo` has use to complete it's operation. To be able to test `foo` we need to mock the behavior of `d1` and `d2`. A standard technique to do this is via [Dependency Injection](#dependency-injection).

## Dependency Injection

We simply pass the dependencies as arguments to the function.

```diff
- const foo = (a: number, b: number): number => {
+ const foo = (d1: D1, d2: D2, a: number, b: number): number => {
    return d1(a) + d2(b)
  }
```

While testing we can pass mock dependencies and then assert the output of the function.

## Pipe Dependencies

Let's say we have a function `bar`, that's calling `foo`.

```diff
+ interface D1 {
+   (n: number): number
+ }
+
+ interface D2 {
+   (n: number): number
+ }

  const foo = (d1: D1, d2: D2, a: number, b: number): number => {
    return d1(a) + d2(b)
  }

+ const bar = (): number => {
+   return foo(d1, d2, 10, 20)
+ }
```

Now `bar` needs to pass on the dependencies to `foo`, which makes `bar` untestable.

### Make bar testable

Passing `d1` and `d2` to `bar`, makes both `foo` and `bar` testable.

```diff
  interface D1 {
    (n: number): number
  }

  interface D2 {
    (n: number): number
  }

  const foo = (d1: D1, d2: D2, a: number, b: number): number => {
    return d1(a) + d2(b)
  }

- const bar = (): number => {
+ const bar = (d1: D1, d2: D2): number => {
    return foo(d1, d2, 10, 20)
  }
```

### Add main

We can apply the same dependency injection idea to `main` to make it testable.

```diff
  interface D1 {
    (n: number): number
  }

  interface D2 {
    (n: number): number
  }

  const foo = (d1: D1, d2: D2, a: number, b: number): number => {
    return d1(a) + d2(b)
  }

  const bar = (d1: D1, d2: D2): number => {
    return foo(d1, d2, 10, 20)
  }

+ export const main = (d1: D1, d2: D2): void => {
+   bar(d1, d2)
+ }
```

### Change dependency

Consider a case where `foo` adds a new dependency `d3`.

```diff
  interface D1 {
    (n: number): number
  }

  interface D2 {
    (n: number): number
  }
+
+ interface D3 {
+   (n: number, m: number): number
+ }
+
- const foo = (d1: D1, d2: D2, a: number, b: number): number => {
+ const foo = (d1: D1, d2: D2, d3: D3, a: number, b: number): number => {
-   return d1(a) + d2(b)
+   return d3(d1(a), d2(b))
  }

- const bar = (d1: D1, d2: D2): number => {
+ const bar = (d1: D1, d2: D2, d3: D3): number => {
-   return foo(d1, d2, 10, 20)
+   return foo(d1, d2, d3, 10, 20)
  }

- export const main = (d1: D1, d2: D2): void => {
+ export const main = (d1: D1, d2: D2, d3: D3): void => {
-   bar(d1, d2)
+   bar(d1, d2, d3)
  }
```

We needed to change the type signatures for `foo`, `bar` and `main`. This is extremely hard to maintain also, every time there is a dependency added or removed, you have to go and update all the function calls.

### Add Env

Instead of passing each dependency as separate arguments we can also merge them into one.

```diff
  interface D1 {
    (n: number): number
  }

  interface D2 {
    (n: number): number
  }

  interface D3 {
    (n: number, m: number): number
  }
+
+ interface D1Env {
+   d1: D1
+ }
+
+ interface D2Env {
+   d2: D2
+ }
+
+ interface D3Env {
+   d3: D3
+ }
+
- const foo = (d1: D1, d2: D2, d3: D3, a: number, b: number): number => {
-   return d3(d1(a), d2(b))
- }
+ const foo = (D: D1Env & D2Env & D3Env, a: number, b: number): number => {
+   return D.d3(D.d1(a), D.d2(b))
+ }

- const bar = (d1: D1, d2: D2, d3: D3): number => {
-   return foo(d1, d2, d3, 10, 20)
- }
+ const bar = (D: D1Env & D2Env & D3Env): number => {
+   return foo(D, 10, 20)
+ }

- export const main = (d1: D1, d2: D2, d3: D3): void => {
-   bar(d1, d2, d3)
- }
+ export const main = (D: D1Env & D2Env & D3Env): void => {
+   bar(D)
+ }
```

We created an environment for each dependency and then created a special type `D1Env & D2Env & D3Env` that is passed onto each function.
This has reduced the boilerplate significantly, but adding or removing a dependency still requires us to change the function signature.

## Using QIO

We can further solve this problem using QIO.

### Add helpers

To access dependencies we will use `QIO.access`:

```diff
+ import {QIO} from '@qio/core'
+
  interface D1 {
    (n: number): number
  }

  interface D2 {
    (n: number): number
  }

  interface D3 {
    (n: number, m: number): number
  }

  interface D1Env {
    d1: D1
  }

  interface D2Env {
    d2: D1
  }

  interface D3Env {
    d3: D3
  }
+
+ // Helper
+ const d1 = (n: number) => QIO.access((_: D1Env) => _.d1(n))
+ const d2 = (n: number) => QIO.access((_: D2Env) => _.d1(n))
+ const d3 = (n: number, m: number) => QIO.access((_: D3Env) => _.d3(n, m))
+

  const foo = (D: D1 & D2 & D3, a: number, b: number): number => {
    return D.d3(D.d1(a), D.d2(b))
  }

  const bar = (D: D1 & D2 & D3): number => {
    return foo(D, 10, 20)
  }

  export const main = (D: D1 & D2 & D3): void => {
    bar(D)
  }
```

### Update program

```diff
  import {QIO} from '@qio/core'
  interface D1Env {
    d1: D1
  }

  interface D2Env {
    d2: D2
  }

  interface D3Env {
    d3: D3
  }

  const d1 = (n: number) => QIO.access((_: D1Env) => _.d1(n))
  const d2 = (n: number) => QIO.access((_: D2Env) => _.d1(n))
  const d3 = (n: number, m: number) => QIO.access((_: D3Env) => _.d3(n, m))

- const foo = (D: D1Env & D2Env & D3Env, a: number, b: number): number => {
-   return d3(d1(a), d2(b))
- }
+ const foo = (a: number, b: number): QIO<number, never, D1Env & D2Env & D3Env> => {
+   return d1(a).zipWith(d2(b), d3)
+ }

- const bar = (D: D1Env & D2Env & D3Env): number => {
-   foo(D, 10, 20)
- }
+ const bar = (): QIO<number, never, D1Env & D2Env & D3Env> => {
+   return foo(10, 20)
+ }

- export const main = (D: D1Env & D2Env & D3Env): void => {
-   bar(D)
- }
+ export const main = (): QIO<void, never, D1Env & D2Env & D3Env> => {
+   return bar().void
+ }
```

### Final Program

Because the typescript compiler can infer the return types of a function, we can remove the explicit return types.

```ts
import {QIO} from '@qio/core'
interface D1Env {
  d1: D1
}

interface D2Env {
  d2: D2
}

interface D3Env {
  d3: D3
}

const d1 = (n: number) => QIO.access((_: D1Env) => _.d1(n))
const d2 = (n: number) => QIO.access((_: D2Env) => _.d1(n))
const d3 = (n: number, m: number) => QIO.access((_: D3Env) => _.d3(n, m))

const foo = (a: number, b: number) => {
  return d1(a).zipWith(d2(b), d3)
}

const bar = () => {
  return foo(10, 20)
}

export const main = () => {
  return bar().void
}
```

The final code doesn't need to pipe dependencies all the way. QIO automatically handles all the env dependencies.
