import {assert, spy} from 'chai'
import {Either, Option} from 'standard-data-structures'

import {FiberContext} from '../src/internals/Fiber'
import {FIO} from '../src/main/FIO'
import {FStream} from '../src/main/FStream'
import {testRuntime} from '../src/runtimes/TestRuntime'

import {Counter} from './internals/Counter'
import {Snapshot} from './internals/Snapshot'

describe('FiberContext', () => {
  context('on creation', () => {
    context('scheduler idle', () => {
      it('should not execute', () => {
        const counter = new Counter()
        FiberContext.unsafeExecuteWith(counter.inc(), testRuntime())

        assert.strictEqual(counter.count, 0)
      })
    })

    context('scheduler triggers', () => {
      it('should execute', () => {
        const counter = new Counter()
        const runtime = testRuntime()

        FiberContext.unsafeExecuteWith(counter.inc(), runtime)
        runtime.scheduler.run()

        assert.strictEqual(counter.count, 1)
      })
    })
  })

  context('on cancellation', () => {
    it('should not execute', () => {
      const counter = new Counter()
      const runtime = testRuntime()

      const context = FiberContext.unsafeExecuteWith(counter.inc(), runtime)
      context.cancel()
      runtime.scheduler.run()

      assert.strictEqual(counter.count, 0)
    })

    it('should callback with none', () => {
      const runtime = testRuntime()
      const cb = spy()

      const context = FiberContext.unsafeExecuteWith(FIO.of(0), runtime)
      context.unsafeObserve(cb)
      context.cancel()
      runtime.scheduler.run()

      cb.should.be.called.with(Option.none())
    })

    context('observer is added', () => {
      it('should call back with none', () => {
        const runtime = testRuntime()
        const cb = spy()

        const context = FiberContext.unsafeExecuteWith(FIO.of(0), runtime)
        context.cancel()
        context.unsafeObserve(cb)
        runtime.scheduler.run()

        cb.should.be.called.with(Option.none())
      })
    })
  })

  context('on observer cancellation', () => {
    it('should not call observers', () => {
      const runtime = testRuntime()
      const cb = spy()

      FiberContext.unsafeExecuteWith(FIO.of(0), runtime)
        .unsafeObserve(cb)
        .cancel()
      runtime.scheduler.run()

      cb.should.be.not.be.called()
    })
  })

  context('on error', () => {
    it('should call rej with cause', () => {
      const runtime = testRuntime()
      const cb = spy()

      FiberContext.unsafeExecuteWith(FIO.reject(1), runtime).unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Option.some(Either.left(1)))
    })
  })

  context('on success', () => {
    it('should call res with value', () => {
      const runtime = testRuntime()
      const cb = spy()

      FiberContext.unsafeExecuteWith(FIO.of(1), runtime).unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Option.some(Either.left(1)))
    })
  })

  context('on completed', () => {
    it('should call res with computed result', () => {
      const runtime = testRuntime()
      const cb = spy()

      const context = FiberContext.unsafeExecuteWith(FIO.of(1), runtime)
      runtime.scheduler.run()
      context.unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Option.some(Either.right(1)))
    })

    it('should call rej with computed cause', () => {
      const runtime = testRuntime()
      const cb = spy()

      const context = FiberContext.unsafeExecuteWith(FIO.reject(1), runtime)
      runtime.scheduler.run()
      context.unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Option.some(Either.left(1)))
    })
  })

  context('with async', () => {
    it('should wait for completion', () => {
      const runtime = testRuntime()
      const snapshot = new Snapshot()

      FiberContext.unsafeExecuteWith(snapshot.mark('A').delay(1000), runtime)
      runtime.scheduler.run()

      assert.deepStrictEqual(snapshot.timeline, ['A@1001'])
    })
  })

  context('when two fibers are created together', () => {
    it('should be executed in parallel', () => {
      const runtime = testRuntime()
      const snapshot = new Snapshot()

      const A = snapshot.mark('A').delay(1000)

      const B = snapshot.mark('B').delay(2000)

      FiberContext.unsafeExecuteWith(A, runtime)
      FiberContext.unsafeExecuteWith(B, runtime)

      runtime.scheduler.run()

      assert.deepStrictEqual(snapshot.timeline, ['A@1001', 'B@2001'])
    })
  })

  describe('await', () => {
    context('on completion', () => {
      it('should return some result', () => {
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(
          FIO.of(0).fork.chain(_ => _.await)
        )
        const expected = Option.some(Either.right(0))
        assert.deepStrictEqual(actual, expected)
      })
    })
    context('on cancellation', () => {
      it.skip('should return none')
    })
  })

  context('instruction count is reduced', () => {
    it.skip('should cooperatively merge two streams', () => {
      const list = new Array<number>()
      const insert = FIO.encase((_: number) => void list.push(_))

      const runtime = testRuntime({maxInstructionCount: 5})
      FiberContext.unsafeExecuteWith(
        FStream.range(101, 103)
          .merge(FStream.range(901, 903))
          .mapM(insert).drain,
        runtime
      )

      runtime.scheduler.run()

      const expected = [901, 101, 102, 103, 902, 903]
      assert.deepStrictEqual(list, expected)
    })

    it('should switch between multiple contexts', () => {
      const MAX_INSTRUCTION_COUNT = 5
      const runtime = testRuntime({maxInstructionCount: MAX_INSTRUCTION_COUNT})
      const actual = new Array<number>()
      const insert = FIO.encase((_: number) => void actual.push(_))
      const longIO = FIO.of(1)
        .and(FIO.of(2))
        .and(FIO.of(3))
        .and(FIO.of(4))
        .and(FIO.of(5))
        .chain(insert)
      const shortIO = FIO.of(1000).chain(insert)

      FiberContext.unsafeExecuteWith(longIO, runtime)
      FiberContext.unsafeExecuteWith(shortIO, runtime)

      runtime.scheduler.run()

      const expected = [1000, 5]
      assert.deepStrictEqual(actual, expected)
    })
  })
})
