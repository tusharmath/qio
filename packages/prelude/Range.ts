export const range = <A>(s: number, b: number, fn: (i: number) => A): A[] => {
  const A = new Array<A>()
  for (let i = s; i <= b; i++) {
    A.push(fn(i))
  }

  return A
}
