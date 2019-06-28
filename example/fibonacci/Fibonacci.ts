/* tslint:disable: no-console strict-comparisons */

const memoize = <A, B>(fn: (a: A) => B) => {
  const dict = new Map<A, B>()

  return (a: A): B => {
    if (dict.has(a)) {
      return dict.get(a) as B
    }

    const b = fn(a)
    dict.set(a, b)

    return b
  }
}
const fib = memoize((n: bigint): bigint => {
  if (n <= 2n) {
    return n
  }

  return fib(n - 1n) + fib(n - 2n)
})

console.log(fib(10000n))
