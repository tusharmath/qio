import {assert, spy} from 'chai'

import {FIO, FStream, testRuntime} from '..'
import {T} from '../internals/T'

import {Snapshot} from './internals/Snapshot'

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

    it('should call next 4 times', () => {
      const ID = spy(<TT>(_: TT) => FIO.of(_))
      testRuntime().unsafeExecuteSync(FStream.range(100, 103).fold(true, T, ID))

      ID.should.be.called.exactly(4)
    })
  })

  describe('merge', () => {
    it('should merge two streams', () => {
      const actual = new Snapshot()
      const runtime = testRuntime()

      runtime.unsafeExecuteSync(
        FStream.of('A')
          .merge(FStream.of('B'))
          .forEach(_ => actual.mark(_))
      )

      const expected = ['A@1', 'B@1']
      assert.deepStrictEqual(actual.timeline, expected)
    })
    context('lower maxInstructionCount', () => {
      it('should interleave values from two ranges', () => {
        const actual = new Array<number>()
        const insert = FIO.encase((_: number) => void actual.push(_))
        const MAX_INSTRUCTION_COUNT = 5
        const runtime = testRuntime({
          maxInstructionCount: MAX_INSTRUCTION_COUNT
        })

        runtime.unsafeExecuteSync(
          FStream.range(101, 103)
            .merge(FStream.range(901, 903))
            .mapM(insert).drain
        )

        runtime.scheduler.run()

        const expected = [101, 102, 103, 901, 902, 903]
        assert.sameDeepMembers(actual, expected)
        assert.notDeepEqual(actual, expected)
      })
    })
  })

  describe('take', () => {
    it('should take first 2 elements', () => {
      const actual = testRuntime().unsafeExecuteSync(
        FStream.of(1, 2, 3).take(2).asArray
      )
      const expected = [1, 2]
      assert.deepStrictEqual(actual, expected)
    })
  })
})
