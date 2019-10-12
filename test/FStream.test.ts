import {assert} from 'chai'

import {FIO} from '../src/main/FIO'
import {FStream} from '../src/main/FStream'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('FStream', () => {
  describe('of', () => {
    it('should emit provided values', () => {
      const actual = testRuntime().unsafeExecuteSync(
        FStream.of(1, 2, 3).asArray
      )
      const expected = [1, 2, 3]
      assert.deepStrictEqual(actual, expected)
    })

    it('should one value', () => {
      const actual = testRuntime().unsafeExecuteSync(FStream.of(999).asArray)
      const expected = [999]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('forEachWhile', () => {
    it('should emit while true', () => {
      const actual = new Array<number>()
      const push = FIO.encase((I: number) => actual.push(I))
      testRuntime().unsafeExecuteSync(
        FStream.of(1, 2, 3).forEachWhile(_ => push(_).const(true))
      )
      const expected = [1, 2, 3]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('range', () => {
    it('should emit values in range', () => {
      const actual = testRuntime().unsafeExecuteSync(
        FStream.range(100, 103).asArray
      )
      const expected = [100, 101, 102, 103]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('merge', () => {
    it.skip('should merge two streams', () => {
      const actual = testRuntime().unsafeExecuteSync(
        FStream.of(1)
          .merge(FStream.of(2))
          .fold(new Array<number>(), () => true, (s, a) => FIO.of([...s, a]))
      )
      const expected = [1, 2]
      assert.deepStrictEqual(actual, expected)
    })
  })
})
