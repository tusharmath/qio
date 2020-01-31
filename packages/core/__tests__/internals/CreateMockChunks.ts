import {Chunk} from '../../lib/main/Chunk'

export const createMockChunks = (n: number, c: number) => {
  const array = Array.from({length: n}).map((_, i) => i + 1)

  return Chunk.createN(array, c)
}
