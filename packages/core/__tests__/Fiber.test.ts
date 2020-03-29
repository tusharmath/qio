import {assert, spy} from 'chai'

import {FiberContext} from '../lib/internals/Fiber'
import {FiberConfig} from '../lib/internals/FiberConfig'
import {Counter} from '../lib/main/Counter'
import {Exit} from '../lib/main/Exit'
import {QIO} from '../lib/main/QIO'
import {Snapshot} from '../lib/main/Snapshot'
import {testRuntime} from '../lib/runtimes/TestRuntime'

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

      const context = FiberContext.unsafeExecuteWith(QIO.resolve(0), runtime)
      context.unsafeObserve(cb)
      context.cancel()
      runtime.scheduler.run()

      cb.should.be.called.with(Exit.cancel())
    })

    context('observer is added', () => {
      it('should call back with none', () => {
        const runtime = testRuntime()
        const cb = spy()

        const context = FiberContext.unsafeExecuteWith(QIO.resolve(0), runtime)
        context.cancel()
        context.unsafeObserve(cb)
        runtime.scheduler.run()

        cb.should.be.called.with(Exit.cancel())
      })
    })
  })

  context('on observer cancellation', () => {
    it('should not call observers', () => {
      const runtime = testRuntime()
      const cb = spy()

      FiberContext.unsafeExecuteWith(QIO.resolve(0), runtime)
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

      FiberContext.unsafeExecuteWith(QIO.reject(1), runtime).unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Exit.fail(1))
    })
  })

  context('on success', () => {
    it('should call res with value', () => {
      const runtime = testRuntime()
      const cb = spy()

      FiberContext.unsafeExecuteWith(QIO.resolve(1), runtime).unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Exit.succeed(1))
    })
  })

  context('on completed', () => {
    it('should call res with computed result', () => {
      const runtime = testRuntime()
      const cb = spy()

      const context = FiberContext.unsafeExecuteWith(QIO.resolve(1), runtime)
      runtime.scheduler.run()
      context.unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Exit.succeed(1))
    })

    it('should call rej with computed cause', () => {
      const runtime = testRuntime()
      const cb = spy()

      const context = FiberContext.unsafeExecuteWith(QIO.reject(1), runtime)
      runtime.scheduler.run()
      context.unsafeObserve(cb)
      runtime.scheduler.run()

      cb.should.called.with(Exit.fail(1))
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
          QIO.resolve(0)
            .fork()
            .chain((_) => _.await)
        )
        const expected = Exit.succeed(0)
        assert.deepStrictEqual(actual, expected)
      })
    })
    context('on cancellation', () => {
      it('should resolve with None', () => {
        const snapshot = new Snapshot<Exit<string | number, never>>()
        const runtime = testRuntime()

        FiberContext.unsafeExecuteWith(
          QIO.timeout(0, 1000)
            .fork()
            .chain((F) => F.await.chain((_) => snapshot.mark(_)))
            .fork()
            .chain((F) => F.abort.delay(500)),
          runtime
        )

        runtime.scheduler.run()

        assert.deepStrictEqual(snapshot.timelineData, [[Exit.cancel(), 501]])
      })
    })
  })

  context('instruction count is reduced', () => {
    it('should switch between multiple contexts', () => {
      const s = new Snapshot()
      const MAX_INSTRUCTION_COUNT = 5
      const runtime = testRuntime().configure(
        FiberConfig.MAX_INSTRUCTION_COUNT(MAX_INSTRUCTION_COUNT)
      )

      const recursion = QIO.lazy(
        (a: number, e: number): QIO<void> =>
          a === e ? QIO.void() : recursion(a + 1, e)
      )

      const longIO = recursion(1, 100).and(s.mark('LONG'))
      const shortIO = recursion(1, 10).and(s.mark('SHORT'))

      FiberContext.unsafeExecuteWith(longIO, runtime)
      FiberContext.unsafeExecuteWith(shortIO, runtime)

      runtime.scheduler.run()

      assert.deepStrictEqual(s.timeline, ['SHORT@1', 'LONG@1'])
    })
  })

  context('instruction count is zero', () => {
    it('should not fail', () => {
      const snapshot = new Snapshot()
      const runtime = testRuntime().configure(
        FiberConfig.MAX_INSTRUCTION_COUNT(0)
      )
      FiberContext.unsafeExecuteWith(
        QIO.resolve('A').chain((_) => snapshot.mark(_)),
        runtime
      )
      runtime.scheduler.run()

      assert.deepStrictEqual(snapshot.timeline, ['A@1'])
    })
  })

  context('instruction count is negative', () => {
    it('should not fail', () => {
      const snapshot = new Snapshot()
      const runtime = testRuntime().configure(
        FiberConfig.MAX_INSTRUCTION_COUNT(-100)
      )
      FiberContext.unsafeExecuteWith(
        QIO.resolve('A').chain((_) => snapshot.mark(_)),
        runtime
      )
      runtime.scheduler.run()

      assert.deepStrictEqual(snapshot.timeline, ['A@1'])
    })
  })
})
