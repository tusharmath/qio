import {
  Await,
  Counter,
  FiberConfig,
  QIO,
  Snapshot,
  testRuntime,
} from '@qio/core'
import {range, T} from '@qio/prelude'
import {assert, spy} from 'chai'
import {EventEmitter} from 'events'

import {QStream} from '../lib/QStream'

describe('QStream', () => {
  describe('of', () => {
    it('should emit provided values', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QStream.of(1, 2, 3).asArray
      )
      const expected = [1, 2, 3]
      assert.deepStrictEqual(actual, expected)
    })

    it('should one value', () => {
      const actual = testRuntime().unsafeExecuteSync(QStream.of(999).asArray)
      const expected = [999]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('forEachWhile', () => {
    it('should emit while true', () => {
      const actual = new Array<number>()
      const push = QIO.encase((I: number) => actual.push(I))
      testRuntime().unsafeExecuteSync(
        QStream.of(1, 2, 3).forEachWhile((_) => push(_).const(true))
      )
      const expected = [1, 2, 3]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('range', () => {
    it('should emit values in range', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QStream.range(100, 103).asArray
      )
      const expected = [100, 101, 102, 103]
      assert.deepStrictEqual(actual, expected)
    })

    it('should call next 4 times', () => {
      const ID = spy(<TT>(_: TT) => QIO.resolve(_))
      testRuntime().unsafeExecuteSync(QStream.range(100, 103).fold(true, T, ID))

      ID.should.be.called.exactly(4)
    })
  })

  describe('merge', () => {
    it('should merge two streams', () => {
      const actual = new Snapshot()
      const runtime = testRuntime()

      runtime.unsafeExecuteSync(
        QStream.of('A')
          .merge(QStream.of('B'))
          .forEach((_) => actual.mark(_))
      )

      const expected = ['A@1', 'B@1']
      assert.deepStrictEqual(actual.timeline, expected)
    })
    context('lower maxInstructionCount', () => {
      it('should interleave values from two ranges', () => {
        const actual = new Array<number>()
        const insert = QIO.encase((_: number) => void actual.push(_))
        const MAX_INSTRUCTION_COUNT = 5
        const runtime = testRuntime().configure(
          FiberConfig.MAX_INSTRUCTION_COUNT(MAX_INSTRUCTION_COUNT)
        )

        runtime.unsafeExecuteSync(
          QStream.range(101, 103).merge(QStream.range(901, 903)).mapM(insert)
            .drain
        )

        const expected = [101, 102, 103, 901, 902, 903]
        assert.sameDeepMembers(actual, expected)
        assert.notDeepEqual(actual, expected)
      })
    })
  })

  describe('take', () => {
    it('should take first 2 elements', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QStream.of(1, 2, 3).take(2).asArray
      )
      const expected = [1, 2]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('scanM', () => {
    it('should keep producing accumulated values', () => {
      const source = QStream.range(1, 5).scanM(0, (a, b) => QIO.resolve(a + b))

      const actual = testRuntime().unsafeExecuteSync(source.asArray)
      const expected = [1, 3, 6, 10, 15]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('haltWhen', () => {
    it('should take value until the io resolves', () => {
      const program = Await.of<number>().chain((awt) => {
        const setter = awt.set(QIO.timeout(-100, 50))

        const source = QStream.range(0, 10)
          .mapM((_) => QIO.timeout(_, 10))
          .haltWhen(awt)

        return source.asArray.zipWithPar(setter, (a) => a)
      })

      const actual = testRuntime().unsafeExecuteSync(program)
      const expected = [0, 1, 2, 3, 4]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('haltWhenM', () => {
    it('should take value until the io resolves', () => {
      const program = QStream.range(0, 10)
        .mapM((_) => QIO.timeout(_, 10))
        .haltWhenM(QIO.void().delay(50)).asArray

      const actual = testRuntime().unsafeExecuteSync(program)
      const expected = [0, 1, 2, 3, 4]

      assert.deepStrictEqual(actual, expected)
    })

    context('IO never completes', () => {
      it('should still complete', () => {
        const program = QStream.range(1, 3)
          .haltWhenM(QIO.never())
          .fold(
            new Array<number>(),
            () => true,
            (s, a) => QIO.resolve([...s, a])
          )

        const actual = testRuntime().unsafeExecuteSync(program)
        const expected = [1, 2, 3]

        assert.deepStrictEqual(actual, expected)
      })
    })
  })

  describe('fromEventEmitter', () => {
    it('should produce emitted values', () => {
      // Setup
      const runtime = testRuntime()
      const emitter = new EventEmitter()
      const emit = () => range(1, 5, (_) => emitter.emit('data', _))
      runtime.scheduler.delay(emit, 100)

      // Create Program
      const program = QStream.fromEventEmitter<number>(emitter, 'data').take(5)

      // Assert
      const actual = runtime.unsafeExecuteSync(program.asArray)
      const expected = [1, 2, 3, 4, 5]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('zipWith', () => {
    it('should combine the results of two streams', () => {
      const L = QStream.interval('TEST', 100)
      const R = QStream.range(0, Infinity)
      const LR = L.zipWith(R, (str, num) => str + ':' + num).take(5)
      const actual = testRuntime().unsafeExecuteSync(LR.asArray)
      const expected = ['TEST:0', 'TEST:1', 'TEST:2', 'TEST:3', 'TEST:4']
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('forEach', () => {
    context('async values', () => {
      it('should stop on abortion', () => {
        const counter = new Counter()
        const COUNT = 9
        const program = QStream.interval(1, 10)
          .forEach((_) => counter.inc(_))
          .fork()
          .chain((F) => F.abort.delay(100))

        testRuntime().unsafeExecuteSync(program)

        const actual = counter.count
        const expected = COUNT

        assert.strictEqual(actual, expected)
      })
    })
  })
  describe('toQueue', () => {
    it('should convert a stream to a queue', () => {
      const program = QStream.range(0, 10)
        .toQueue()
        .use((Q) => Q.takeN(5))
      const actual = testRuntime().unsafeExecuteSync(program)
      const expected = [0, 1, 2, 3, 4]
      assert.deepStrictEqual(actual, expected)
    })

    it('should by async', () => {
      const program = QStream.range(0, 10)
        .toQueue(1)
        .use((Q) => Q.takeN(5))
      const actual = testRuntime().unsafeExecuteSync(program)
      const expected = [0, 1, 2, 3, 4]
      assert.deepStrictEqual(actual, expected)
    })
  })
  describe('zipWithIndex', () => {
    it('should create values with index', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QStream.range(0, 10).const('A').zipWithIndex.take(4).asArray
      )

      const expected = [
        {0: 'A', 1: 0},
        {0: 'A', 1: 1},
        {0: 'A', 1: 2},
        {0: 'A', 1: 3},
      ]

      assert.deepStrictEqual(actual, expected)
    })
  })
})
