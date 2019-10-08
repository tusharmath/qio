import {assert, spy} from 'chai'
import {Either, Option} from 'standard-data-structures'
import {testScheduler} from 'ts-scheduler/test'

import {FiberContext} from '../src/internals/FiberContext'
import {FIO} from '../src/main/FIO'
import {testRuntime} from '../src/runtimes/TestRuntime'

import {Counter} from './internals/Counter'
import {Snapshot} from './internals/Snapshot'

describe('FiberContext', () => {
  context('on creation', () => {
    context('scheduler idle', () => {
      it('should not execute', () => {
        const counter = new Counter()
        const scheduler = testScheduler()

        FiberContext.evaluateWith(counter.inc(), scheduler)

        assert.strictEqual(counter.count, 0)
      })
    })

    context('scheduler triggers', () => {
      it('should execute', () => {
        const counter = new Counter()
        const scheduler = testScheduler()

        FiberContext.evaluateWith(counter.inc(), scheduler)
        scheduler.run()

        assert.strictEqual(counter.count, 1)
      })
    })
  })

  context('on cancellation', () => {
    it('should not execute', () => {
      const counter = new Counter()
      const scheduler = testScheduler()

      const context = FiberContext.evaluateWith(counter.inc(), scheduler)
      context.cancel()
      scheduler.run()

      assert.strictEqual(counter.count, 0)
    })

    it('should callback with none', () => {
      const scheduler = testScheduler()
      const cb = spy()

      const context = FiberContext.evaluateWith(FIO.of(0), scheduler)
      context.unsafeObserve(cb)
      context.cancel()
      scheduler.run()

      cb.should.be.called.with(Option.none())
    })

    context('observer is added', () => {
      it('should call back with none', () => {
        const scheduler = testScheduler()
        const cb = spy()

        const context = FiberContext.evaluateWith(FIO.of(0), scheduler)
        context.cancel()
        context.unsafeObserve(cb)
        scheduler.run()

        cb.should.be.called.with(Option.none())
      })
    })
  })

  context('on observer cancellation', () => {
    it('should not call observers', () => {
      const scheduler = testScheduler()
      const cb = spy()

      FiberContext.evaluateWith(FIO.of(0), scheduler)
        .unsafeObserve(cb)
        .cancel()
      scheduler.run()

      cb.should.be.not.be.called()
    })
  })

  context('on error', () => {
    it('should call rej with cause', () => {
      const scheduler = testScheduler()
      const cb = spy()

      FiberContext.evaluateWith(FIO.reject(1), scheduler).unsafeObserve(cb)
      scheduler.run()

      cb.should.called.with(Option.some(Either.left(1)))
    })
  })

  context('on success', () => {
    it('should call res with value', () => {
      const scheduler = testScheduler()
      const cb = spy()

      FiberContext.evaluateWith(FIO.of(1), scheduler).unsafeObserve(cb)
      scheduler.run()

      cb.should.called.with(Option.some(Either.left(1)))
    })
  })

  context('on completed', () => {
    it('should call res with computed result', () => {
      const scheduler = testScheduler()
      const cb = spy()

      const context = FiberContext.evaluateWith(FIO.of(1), scheduler)
      scheduler.run()
      context.unsafeObserve(cb)
      scheduler.run()

      cb.should.called.with(Option.some(Either.right(1)))
    })

    it('should call rej with computed cause', () => {
      const scheduler = testScheduler()
      const cb = spy()

      const context = FiberContext.evaluateWith(FIO.reject(1), scheduler)
      scheduler.run()
      context.unsafeObserve(cb)
      scheduler.run()

      cb.should.called.with(Option.some(Either.left(1)))
    })
  })

  context('with async', () => {
    it('should wait for completion', () => {
      const runtime = testRuntime()
      const snapshot = new Snapshot()
      const scheduler = runtime.scheduler

      FiberContext.evaluateWith(
        snapshot
          .mark('A')
          .delay(1000)
          .provide({runtime}),
        scheduler
      )
      scheduler.run()

      assert.deepStrictEqual(snapshot.timeline, ['A@1001'])
    })
  })

  context('when two fibers are created together', () => {
    it('should be executed in parallel', () => {
      const runtime = testRuntime()
      const snapshot = new Snapshot()
      const scheduler = runtime.scheduler

      const A = snapshot
        .mark('A')
        .delay(1000)
        .provide({runtime})
      const B = snapshot
        .mark('B')
        .delay(2000)
        .provide({runtime})

      FiberContext.evaluateWith(A, scheduler)
      FiberContext.evaluateWith(B, scheduler)

      scheduler.run()

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
})
