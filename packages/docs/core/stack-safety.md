---
title: Stack Safety
---

Consider the following recursive **fibonacci** implementation in typescript:

```ts
const fib = (a: bigint, l: bigint = 0n, r: bigint = 1n): bigint => {
  if (a <= 2n) {
    return l + r
  }

  return fib(a - 1n, r, l + r)
}

fib(10n) // 55n
```

This recursion eventually causes a **stack overflow** exception at around `fib(6982n)`.

```error
/fib.js:2
const fib = (a, l = 0n, r = 1n) => {
            ^

RangeError: Maximum call stack size exceeded
    at fib (/fib.js:2:13)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
    at fib (/fib.js:6:12)
```

## Lazy Evaluation

Using `QIO.lazy` we can convert the recursive calls, into lazy ones. That way we make sure the function isn't immediately invoked thus guarantying stack safety.

```diff
- const fib = (a: bigint, l: bigint = 0n, r: bigint = 1n): bigint => {
+ const fib = QIO.lazy((a: bigint, l: bigint = 0n, r: bigint = 1n): QIO<bigint> => {
    if (a <= 2n) {
-     return l + r
+     return QIO.resolve(l + r)
    }

    return fib(a - 1n, r, l + r)
 - }
 + })

  fib(10n) // 55n
+ fib(1_000_000n) // 208,988 digit long number
```

Now `fib` can theoretically compute the value for any `bigint` value. Practically though, because `bigint` internally uses heap you might be out of system memory eventually which will crash your process.
