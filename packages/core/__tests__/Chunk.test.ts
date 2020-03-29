import {assert} from 'chai'

import {Chunk} from '../lib/main/Chunk'

import {createArray} from './internals/CreateArray'

describe('Chunk', () => {
  describe('of', () => {
    it('should return an instance of Chunk', () => {
      const chunk = Chunk.of(0)
      assert.instanceOf(chunk, Chunk)
    })
  })

  describe('from', () => {
    it('should return an instance of Chunk', () => {
      const chunk = Chunk.from([1, 2, 3])
      assert.instanceOf(chunk, Chunk)
    })
  })

  describe('createN', () => {
    const createMockChunks = (n: number, c: number) => {
      const array = Array.from({length: n}).map((_, i) => i + 1)

      return Chunk.createN(array, c)
    }

    const spec = (n: number, c: number, expected: number[][]) => {
      it(`should produce chunks ${n}, ${c}`, () => {
        assert.deepStrictEqual(
          createMockChunks(n, c),
          expected
            .map((_) => Chunk.from(_))
            .reduce((_, that) => _.concat(that), Chunk.empty())
        )
      })
    }

    spec(6, 2, [
      [1, 2, 3],
      [4, 5, 6],
    ])

    spec(7, 2, [
      [1, 2, 3],
      [4, 5, 6, 7],
    ])

    spec(9, 2, [
      [1, 2, 3, 4],
      [5, 6, 7, 8, 9],
    ])

    spec(5, 3, [[1], [2, 3], [4, 5]])
    spec(7, 5, [[1], [2], [3], [4, 5], [6, 7]])

    spec(11, 5, [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10, 11],
    ])

    spec(9, 5, [[1], [2, 3], [4, 5], [6, 7], [8, 9]])
  })

  describe('filter', () => {
    it('should filter matching values only', () => {
      const chunks = Chunk.createN(
        [...Array.from({length: 10}, (_, i) => i)],
        3
      )

      const actual = chunks.filter((_) => _ % 2 === 0).asArray
      const expected = [0, 2, 4, 6, 8]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('asArray', () => {
    it('should return an array', () => {
      const testArray = [...Array.from({length: 10}, (_, i) => i)]

      const actual = Chunk.createN(testArray, 3).asArray
      const expected = testArray

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('map', () => {
    it('should transform the values', () => {
      const testArray = createArray(5)

      const actual = Chunk.from(testArray).map((_) => _ * 10).asArray
      const expected = [0, 10, 20, 30, 40]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('concat', () => {
    context('with empty', () => {
      it('should return this', () => {
        const a1 = Chunk.from([1, 2, 3])
        const actual = a1.concat(Chunk.empty())
        const expected = a1

        assert.strictEqual(actual, expected)
      })
    })
    context('for empty', () => {
      it('should return the other', () => {
        const a1 = Chunk.from([1, 2, 3])
        const actual = Chunk.empty().concat(a1)
        const expected = a1

        assert.strictEqual(actual, expected)
      })
    })
  })
  describe('iterator', () => {
    describe('of', () => {
      it('should return the provided value', () => {
        const result = [...Chunk.of(10)]
        assert.deepStrictEqual(result, [10])
      })
    })

    describe('from', () => {
      it('should be an iterable', () => {
        const input = [1, 2, 3]
        const result = [...Chunk.from(input)]

        assert.deepStrictEqual(result, input)
      })
    })

    describe('concat', () => {
      it('should be an iterable', () => {
        const a1 = [1, 2, 3]
        const a2 = [4, 5, 6]
        const result = [...Chunk.from(a1).concat(Chunk.from(a2))]

        assert.deepStrictEqual(result, [...a1, ...a2])
      })
    })

    describe('empty', () => {
      it('should return empty', () => {
        const result = [...Chunk.empty()]
        assert.deepStrictEqual(result, [])
      })
    })
  })
})
