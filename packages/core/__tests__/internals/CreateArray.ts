export const createArray = (n: number) => [
  ...Array.from({length: n}, (_, i) => i),
]
