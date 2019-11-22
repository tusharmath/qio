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
  const foo = (d1: D1, d2: D2, a: number, b: number): number => {
    return d1(a) + d2(b)
  }

  const bar = (d1: D1, d2: D2): number => {
    return foo(d1, d2, 10, 20)
  }

+ const main = (d1: D1, d2: D2): void => {
+   bar(d1, d2)
+ }
```

### Refactor

Consider a case where `foo` adds a new dependency `d3`.

```diff
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

- const main = (d1: D1, d2: D2): void => {
+ const main = (d1: D1, d2: D2, d3: D3): void => {
-   bar(d1, d2)
+   bar(d1, d2, d3)
  }
```

We needed to change the type signatures for `foo`, `bar` and `main`.

## Using QIO

The problem in the above approach is :

1. All the dependencies have to be manually piped into each function call.
2. Changing dependencies at a lower level, causes changes in functions at higher levels.
3. `main` or the root function ends up having dependency bloat on its arguments.

We can solve this problem more elegantly using QIO.

### Create Environment

First create environments that have access to each of the dependencies.

```diff
+ interface D1Env {
+   d1: (n: number) => number
+ }
+
+ interface D2Env {
+   d2: (n: number) => number
+ }
+
+ interface D3Env {
+   d3: (n: number, m: number) => number
+ }
```

To access dependencies we will use `QIO.access`:

```diff
+ import {QIO} from '@qio/core'
  interface D1Env {
    d1: (n: number) => number
  }

  interface D2Env {
    d2: (n: number) => number
  }

  interface D3Env {
    d3: (n: number, m: number) => number
  }
+
+ const d1 = (n: number) => QIO.access((_: D1Env) => _.d1(n))
+ const d2 = (n: number) => QIO.access((_: D2Env) => _.d1(n))
+ const d3 = (n: number, m: number) => QIO.access((_: D3Env) => _.d3(n, m))
```

Below are the return types for each of the dependency.

| Instance | Type                        |
| -------- | --------------------------- |
| `d1`     | `QIO<number, never, D1Env>` |
| `d2`     | `QIO<number, never, D2Env>` |
| `d3`     | `QIO<number, never, D3Env>` |

### Update program

```diff
  import {QIO} from '@qio/core'
  interface D1Env {
    d1: (n: number) => number
  }

  interface D2Env {
    d2: (n: number) => number
  }

  interface D3Env {
    d3: (n: number, m: number) => number
  }

  const d1 = (n: number) => QIO.access((_: D1Env) => _.d1(n))
  const d2 = (n: number) => QIO.access((_: D2Env) => _.d1(n))
  const d3 = (n: number, m: number) => QIO.access((_: D3Env) => _.d3(n, m))

- const foo = (d1: D1, d2: D2, d3: D3, a: number, b: number): number => {
-   return d3(d1(a), d2(b))
- }
+ const foo = (a: number, b: number): QIO<number, never, D1Env & D2Env & D3Env> => {
+   return d1(a).zipWith(d2(b), d3)
+ }

- const bar = (d1: D1, d2: D2, d3: D3): number => {
-   foo(d1, d2, d3, 10, 20)
- }
+ const bar = (): QIO<number, never, D1Env & D2Env & D3Env> => {
+   return foo(10, 20)
+ }

- const main = (d1: D1, d2: D2, d3: D3): void => {
-   bar(d1, d2, d3)
- }
+ const main = (): QIO<void, never, D1Env & D2Env & D3Env> => {
+   return bar(d1, d2, d3).void
+ }
```
