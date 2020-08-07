/* tslint:disable: max-file-line-count */
/**
 * Created by tushar on 2019-05-24
 */

import {assert, spy} from 'chai'
import {Either} from 'standard-data-structures'

import {FiberContext} from '../lib/internals/Fiber'
import {Counter} from '../lib/main/Counter'
import {QIO} from '../lib/main/QIO'
import {Snapshot} from '../lib/main/Snapshot'
import {defaultRuntime} from '../lib/runtimes/DefaultRuntime'
import {testRuntime} from '../lib/runtimes/TestRuntime'

describe('QIO', () => {
  describe('of', () => {
    it('should evaluate to a constant value', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(QIO.resolve(1000))
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('map', () => {
    it('should map over the value', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.resolve(1000).map((i) => i + 1)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('chain', () => {
    it('should error on first failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.reject(err).chain((_) => QIO.resolve(1))
      )

      assert.deepEqual(actual, err)
    })

    it('should error on second failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.resolve(1).chain((_) => QIO.reject(err))
      )

      assert.deepEqual(actual, err)
    })
  })

  describe('access', () => {
    it('should access a value and transform', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.access((name: string) => name.length).provide('QIO')
      )
      const expected = 3
      assert.strictEqual(actual, expected)
    })
  })

  describe('reject', () => {
    it('should sequence the operations', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.reject(new Error('foo'))
      ) as Error
      const expected = 'foo'
      assert.deepEqual(actual.message, expected)
    })

    it('should skip pre catch', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QIO.reject(10)
          .map((_) => _ * 2)
          .catch((_) => QIO.resolve(_ * 3))
      )
      const expected = 30
      assert.strictEqual(actual, expected)
    })

    it('should pass post catch', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QIO.reject(10)
          .map((_) => _ * 2)
          .map((_) => _ * 2)
          .map((_) => _ * 2)
          .catch((_) => QIO.resolve(_ * 3))
          .map((_) => _ + 1)
          .map((_) => _ + 1)
          .map((_) => _ + 1)
      )
      const expected = 33
      assert.strictEqual(actual, expected)
    })
  })

  describe('interruptible', () => {
    it('should evaluate asynchronously', async () => {
      const runtime = defaultRuntime()
      const actual = await runtime.unsafeExecutePromise(
        QIO.interruptible((res, rej) => {
          const id = setTimeout(res, 100, 1000)

          return {cancel: () => clearTimeout(id)}
        })
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      const cancel = spy()
      const runtime = testRuntime()
      const cancellable = runtime.unsafeExecute(
        QIO.interruptible(() => ({cancel}))
      )
      runtime.scheduler.run()
      cancellable.cancel()
      cancel.should.be.called()
    })
  })

  describe('zip', () => {
    it('should error on first failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.reject(err).zip(QIO.resolve(1))
      )

      assert.deepEqual(actual, err)
    })

    it('should error on second failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.resolve(1).zip(QIO.reject(err))
      )

      assert.deepEqual(actual, err)
    })
  })

  describe('try', () => {
    it('should call the cb function', () => {
      const cb = spy()
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(QIO.try(cb))

      cb.should.be.called()
    })

    it('should be cancellable', () => {
      let actual = 1000
      const runtime = testRuntime()
      runtime.unsafeExecute(QIO.try(() => ++actual)).cancel()
      runtime.scheduler.run()
      const expected = 1000
      assert.strictEqual(actual, expected)
    })

    it('should capture exceptions', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.try(() => {
          throw new Error('foo')
        }).catch((err) => QIO.resolve(err.message + '-bar'))
      )
      const expected = 'foo-bar'
      assert.strictEqual(actual, expected)
    })

    it('should fail', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.try(() => {
          throw new Error('foo')
        })
      ) as Error
      const expected = new Error('foo')
      assert.deepStrictEqual(actual.message, expected.message)
    })
  })

  describe('and', () => {
    it('should chain two IOs', () => {
      const M = new Array<string>()
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(
        QIO.try(() => M.push('A')).and(QIO.try(() => M.push('B')))
      )
      const actual = M
      const expected = ['A', 'B']
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('timeout', () => {
    it('should emit the provided value', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(QIO.timeout('Happy', 100))

      const expected = 'Happy'
      assert.strictEqual(actual, expected)
    })
    it('should emit after the provided duration', () => {
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(QIO.timeout('Happy', 100))
      const actual = runtime.scheduler.now()
      const expected = 101
      assert.strictEqual(actual, expected)
    })
  })

  describe('delay', () => {
    it('should delay the io execution', () => {
      let executedAt = -1
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(
        QIO.try(() => (executedAt = runtime.scheduler.now())).delay(1000)
      )

      const expected = 1001
      assert.strictEqual(executedAt, expected)
    })
    it('should emit after the provided duration', () => {
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(QIO.timeout('Happy', 100))
      const actual = runtime.scheduler.now()
      const expected = 101
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      let executed = false
      const runtime = testRuntime()
      const cancellable = runtime.unsafeExecute(
        QIO.try(() => (executed = true)).delay(100)
      )
      runtime.scheduler.runTo(50)
      assert.notOk(executed)
      cancellable.cancel()
      runtime.scheduler.run()
      assert.notOk(executed)
    })
  })

  describe('encase', () => {
    it('should call the encased function', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.encase((a: number, b: number) => a + b)(1, 1000)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('encaseP', () => {
    it('should resolve the encased function', async () => {
      const runtime = defaultRuntime()
      const actual = await runtime.unsafeExecutePromise(
        QIO.encaseP((a: number, b: number) => Promise.resolve(a + b))(1, 1000)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('never', () => {
    it('should never resolve/reject', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(QIO.never())
      const expected = undefined
      assert.strictEqual(actual, expected)
    })
  })

  describe('catch', () => {
    it('should capture exceptions', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.reject(new Error('Bye')).catch((err) => QIO.resolve(err.message))
      )
      const expected = 'Bye'
      assert.strictEqual(actual, expected)
    })

    it('should capture async exceptions', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.uninterruptible<never, Error>((res, rej) =>
          rej(new Error('Bye'))
        ).catch((err) => QIO.resolve(err.message))
      )
      const expected = 'Bye'
      assert.strictEqual(actual, expected)
    })

    it('should capture nested async exceptions', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.uninterruptible<never, Error>((res, rej) => rej(new Error('A')))
          .catch((err) => QIO.reject(new Error(err.message + 'B')))
          .catch((err) => QIO.reject(new Error(err.message + 'C')))
          .catch((err) => QIO.reject(new Error(err.message + 'D')))
          .catch((err) => QIO.resolve(err.message + 'E'))
      )

      const expected = 'ABCDE'
      assert.strictEqual(actual, expected)
    })

    it('should let value pass thru', () => {
      const actual = testRuntime().unsafeExecuteSync(
        QIO.resolve('input')
          .catch((x) => QIO.resolve(['catch', x]))
          .chain((x) => QIO.reject(['chain', x]))
      )
      const expected = ['chain', 'input']

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('once', () => {
    it('should return a memoized IO', () => {
      const counter = new Counter()
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(counter.inc().once.chain((_) => _.and(_)))

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })

    /**
     * Some IOs might take some time to complete.
     * During which if the IO is re-executed, the once operator should wait for the previous one complete.
     */
    it('should handle concurrent set', () => {
      const counter = new Counter()
      const runtime = testRuntime()
      const memoized = runtime.unsafeExecuteSync(counter.inc().delay(100).once)
      // Schedule first run at 10ms
      runtime.scheduler.runTo(10)
      runtime.unsafeExecute(memoized as QIO<number>)
      // Schedule second run at 50ms
      // Trying to execute the IO the second time before the first one completes
      runtime.scheduler.runTo(50)
      runtime.unsafeExecute(memoized as QIO<number>)
      runtime.scheduler.run()
      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })

    it('should run only once for async ios', () => {
      const counter = new Counter()
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(
        counter
          .inc()
          .delay(100)
          .once.chain((_) => _.and(_))
      )

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })

  describe('fork', () => {
    it('should return an instance of Fiber', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(QIO.resolve(10).fork())
      assert.instanceOf(actual, FiberContext)
    })

    it('should complete immediately', () => {
      const runtime = testRuntime()
      const counter = new Counter()
      runtime.unsafeExecute(QIO.timeout('A', 1000).fork().and(counter.inc()))
      runtime.scheduler.runTo(10)
      assert.isTrue(counter.increased)
    })

    describe('join', () => {
      it('should auto run forked fibers', () => {
        const runtime = testRuntime()
        const counter = new Counter()
        const actual = runtime.unsafeExecuteSync(
          counter.inc().fork().chain(QIO.void)
        )

        assert.isUndefined(actual)
        assert.strictEqual(counter.count, 1)
      })

      it('should resume with the io', () => {
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(
          QIO.resolve(10)
            .fork()
            .chain((fiber) => fiber.join)
        )

        const expected = 10
        assert.strictEqual(actual, expected)
      })

      it('should resume async io immediately', () => {
        const a = new Counter()
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(
          a
            .inc()
            .delay(1000)
            .fork()
            .chain((fiber) => fiber.join.delay(100))
        )

        const expected = 1
        assert.strictEqual(actual, expected)
        assert.strictEqual(runtime.scheduler.now(), 1001)
      })

      it('should resolve after the IO is completed', () => {
        const counter = new Counter()
        const runtime = testRuntime()
        runtime.unsafeExecute(
          QIO.resolve(10)
            .delay(100)
            .fork()
            .chain((fib) => fib.join.and(counter.inc()))
        )
        runtime.scheduler.runTo(50)

        const actual = counter.count
        const expected = 0
        assert.deepEqual(actual, expected)
      })

      context('when called multiple times', () => {
        it('should execute only once', () => {
          const counter = new Counter()
          const runtime = testRuntime()
          const io = counter
            .inc(10)
            .fork()
            .chain((F) =>
              F.join
                .zipWith(F.join, (a, b): number[] => [a, b])
                .zipWith(F.join, (a, b): number[] => [...a, b])
            )

          const actual = runtime.unsafeExecuteSync(io)
          const expected = [10, 10, 10]
          assert.deepStrictEqual(actual, expected)
        })
      })
    })

    describe('abort', () => {
      it('should abort the fiber', () => {
        const counter = new Counter()
        const runtime = testRuntime()
        runtime.unsafeExecuteSync(
          counter
            .inc()
            .fork()
            .chain((fiber) => fiber.abort)
        )

        assert.strictEqual(counter.count, 0)
      })

      it('should abort a throwing fiber', () => {
        const counter = new Counter()
        const runtime = testRuntime()
        runtime.unsafeExecuteSync(
          QIO.reject(new Error('Fail'))
            .catch(() => counter.inc())
            .fork()
            .chain((fiber) => fiber.abort)
        )

        assert.strictEqual(counter.count, 0)
      })
    })

    describe('config', () => {
      it('should context switch after the provided duration', () => {
        const snapshot = new Snapshot()
        const fn = QIO.lazy(
          (a: number): QIO<void> => (a === 0 ? QIO.void() : fn(a - 1).delay(1))
        )
        const slow = fn(1000).and(snapshot.mark('SLOW'))
        const fast = fn(10).and(snapshot.mark('FAST'))
        const program = slow.par(fast)

        testRuntime().unsafeExecuteSync(program)
        const actual = snapshot.timeline

        assert.deepStrictEqual(actual, ['FAST@11', 'SLOW@1001'])
      })
    })
  })

  describe('zipWith', () => {
    it('should sequentially combine two QIO', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.resolve(10).zipWith(QIO.resolve(20), (a, b) => a + b)
      )
      const expected = 30
      assert.strictEqual(actual, expected)
    })

    it('should error on first failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.reject(err).zipWith(QIO.resolve(1), (a, b) => [a, b])
      )

      assert.deepEqual(actual, err)
    })

    it('should error on second failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.resolve(1).zipWith(QIO.reject(err), (a, b) => [a, b])
      )

      assert.deepEqual(actual, err)
    })
  })

  describe('zipWithPar', () => {
    it('should combine two IO', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.resolve(10).zipWithPar(QIO.resolve(20), (a, b) => [a, b])
      )

      assert.deepEqual(actual, [10, 20])
    })

    it('should error on first failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.reject(err).zipWithPar(QIO.resolve(1), (a, b) => [a, b])
      )

      assert.deepEqual(actual, err)
    })

    it('should error on second failure', () => {
      const err = new Error('oups')
      const actual = testRuntime().unsafeExecuteSync(
        QIO.resolve(1).zipWithPar(QIO.reject(err), (a, b) => [a, b])
      )

      assert.deepEqual(actual, err)
    })

    it('should combine them in parallel', () => {
      const left = QIO.resolve(10).delay(1500)
      const right = QIO.resolve(20).delay(1000)
      const runtime = testRuntime()
      runtime.unsafeExecuteSync(left.zipWithPar(right, (a, b) => [a, b]))

      const actual = runtime.scheduler.now()
      assert.strictEqual(actual, 1501)
    })

    it('should output the result', () => {
      const left = QIO.resolve(10).delay(1500)
      const right = QIO.resolve(20).delay(1000)
      const runtime = testRuntime()

      const actual = runtime.unsafeExecuteSync(
        left.zipWithPar(right, (a, b) => [a, b])
      )
      assert.deepEqual(actual, [10, 20])
    })

    context('when left rejects', () => {
      it('should abort the pending', () => {
        const counter = new Counter()
        const left = QIO.reject(10).delay(500)
        const right = counter.inc().delay(1000)
        const runtime = testRuntime()

        runtime.unsafeExecuteSync(left.zipWithPar(right, (a, b) => [a, b]))
        assert.deepEqual(counter.count, 0)
      })

      it('should return cause', () => {
        const ERROR_MESSAGE = 'FAIL'
        const L = QIO.reject(new Error(ERROR_MESSAGE)).delay(100)
        const R = QIO.resolve(10).delay(200)

        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(
          L.zipWithPar(R, (l, r) => 0)
        ) as Error

        const expected = new Error(ERROR_MESSAGE)
        assert.strictEqual(actual.message, expected.message)
      })
    })

    context('when right rejects', () => {
      it('should return cause', () => {
        const ERROR_MESSAGE = 'FAIL'
        const A = QIO.resolve(10).delay(100)
        const B = QIO.reject(new Error(ERROR_MESSAGE)).delay(50)

        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(
          A.zipWithPar(B, (l, r) => 0)
        ) as Error

        const expected = new Error(ERROR_MESSAGE)
        assert.strictEqual(actual.message, expected.message)
      })
    })
  })

  describe('raceWith', () => {
    it('should run in parallel', () => {
      const snapshot = new Snapshot()

      const a = snapshot.mark('A').delay(1000)
      const b = snapshot.mark('B').delay(2000)

      const runtime = testRuntime()
      runtime.unsafeExecuteSync(a.raceWith(b, QIO.void, QIO.void))

      assert.deepEqual(snapshot.timeline, ['A@1001', 'B@2001'])
    })

    it('should complete when either complete', () => {
      const snapshot = new Snapshot()

      const F1 = snapshot.mark('A').delay(1000)
      const F2 = snapshot.mark('B').delay(2000)
      const runtime = testRuntime()

      runtime.unsafeExecuteSync(
        F1.raceWith(F2, QIO.void, QIO.void).and(snapshot.mark('C'))
      )

      assert.sameDeepMembers(snapshot.timeline, ['A@1001', 'B@2001', 'C@1001'])
    })

    context('when slower is cancelled', () => {
      it('should complete with the fastest', () => {
        const snapshot = new Snapshot()

        const F1 = snapshot.mark('A').delay(1000)
        const F2 = snapshot.mark('B').delay(2000)
        const runtime = testRuntime()

        runtime.unsafeExecuteSync(
          F1.raceWith(
            F2,
            (E, F) => F.abort.and(QIO.fromExit(E)),
            (E, F) => F.abort.and(QIO.fromExit(E))
          ).and(snapshot.mark('C'))
        )

        assert.deepEqual(snapshot.timeline, ['A@1001', 'C@1001'])
      })

      it('should return the fastest produced value', () => {
        const F1 = QIO.resolve('A')
        const F2 = QIO.resolve('B')
        const runtime = testRuntime()

        const actual = runtime.unsafeExecuteSync(
          F1.raceWith(
            F2,
            (E, F) => F.abort.and(QIO.fromExit(E)),
            (E, F) => F.abort.and(QIO.fromExit(E))
          )
        )

        assert.strictEqual(actual, 'A')
      })
    })

    it('should call both cbs', () => {
      const a = QIO.resolve('A').delay(1000)
      const b = QIO.resolve('B').delay(2000)
      const cbA = spy(QIO.void)
      const cbB = spy(QIO.void)

      const runtime = testRuntime()
      runtime.unsafeExecuteSync(a.raceWith(b, cbA, cbB))

      cbA.should.be.called()
      cbB.should.be.called()
    })

    it('should return the output', () => {
      const a = QIO.resolve('A').delay(1000)
      const b = QIO.resolve('B').delay(2000)

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        a.raceWith(
          b,
          () => QIO.resolve(10),
          () => QIO.resolve(20)
        )
      )

      assert.strictEqual(actual, 10)
    })

    context.skip('when stacked', () => {
      /**
       * FAILING TEST
       * This is bound to happen because of how the fibers are created.
       * When racing between L & R (two QIO instances) First L is scheduled using F1 and then R using F2.
       * Once L is evaluated and new L & R are created in the following example.
       * They are scheduled using F3 & F4 respectively.
       * Execution follows the same order F1 -> F2 -> F3 -> F4.
       * So the initial R is evaluated first and then F3 and F4 are evaluated.
       * Even if we reverse the order ie. scheduled R and then L.
       * It will have the same effect.
       * F2 -> F1 -> F4 -> F3.
       * Again as you can see F2 is evaluated before F3 and F4.
       *
       * Thus it is an unsolvable problem at the moment.
       */
      it('should maintain in order', () => {
        const mLogger = new Snapshot()
        const program = QIO.resolve([])
          .raceWith(mLogger.mark(1), QIO.void, QIO.void)
          .raceWith(mLogger.mark(2), QIO.void, QIO.void)

        testRuntime().unsafeExecuteSync(program.provide({logger: mLogger}))

        assert.deepStrictEqual(mLogger.timeline, ['1@1', '2@1'])
      })
    })
  })

  describe('race', () => {
    it('should return the fastest', () => {
      const snapshot = new Snapshot()

      const a = snapshot.mark('A').delay(1000)
      const b = snapshot.mark('B').delay(2000)

      const runtime = testRuntime()
      runtime.unsafeExecuteSync(a.race(b))

      assert.deepEqual(snapshot.timeline, ['A@1001'])
    })

    it('should return the sync produced value', () => {
      const a = QIO.resolve('A')
      const b = QIO.resolve('B').delay(1000)

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(a.race(b))

      assert.strictEqual(actual, 'A')
    })
    context('left never completes', () => {
      it('should return right', () => {
        const R = QIO.resolve('R').delay(1000)
        const L = QIO.never().const('L')

        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(L.race(R))

        assert.strictEqual(actual, 'R')
      })
    })
  })

  describe('provide', () => {
    it('should maintain env for multiple access', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.access((_: string) => _)
          .chain((s) => QIO.access((_: string) => _ + '-' + s))
          .provide('QIO')
      )
      const expected = 'QIO-QIO'

      assert.strictEqual(actual, expected)
    })

    it('should handle nested provides', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.access((_: string) => _.length)
          .chain((a) => QIO.access((b: number) => b + a).provide(100))
          .provide('QIO')
      )
      const expected = 103

      assert.strictEqual(actual, expected)
    })

    it('should handle multiple accesses', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.access((_: string) => _.length)
          .fork()
          .chain((_) => _.join)
          .provide('ABCD')
      )

      const expected = 4
      assert.deepStrictEqual(actual, expected)
    })

    it('should remove from env stack (memory leak)', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.access((_: string) => _.length)
          .provide('QIO')
          .fork()
          .chain((f) =>
            f.join.map(
              // FIXME: remove type-casting and use a proper test.
              () =>
                ((f as unknown) as {
                  [k: string]: []
                }).stackEnv.length
            )
          )
      )
      const expected = 0

      assert.strictEqual(actual, expected)
    })

    it('should provide env to async functions', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.access((_: {n: number}) => _.n + 1)
          .delay(1000)
          .provide({n: 10})
      )
      const expected = 11

      assert.strictEqual(actual, expected)
    })
  })

  describe('par', () => {
    it('should run the IO in parallel', () => {
      const io = QIO.par([
        QIO.resolve(10).delay(1000),
        QIO.resolve(20).delay(1000),
        QIO.resolve(30).delay(1000),
      ])

      const runtime = testRuntime()
      runtime.unsafeExecuteSync(io)
      const actual = runtime.scheduler.now()

      assert.isAbove(actual, 1000)
      assert.isBelow(actual, 1010)
    })

    it('should maintain order', () => {
      const io = QIO.par([QIO.resolve(10), QIO.resolve(20), QIO.resolve(30)])

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('parN', () => {
    it('should run the IO in parallel', () => {
      const io = QIO.parN(3, [
        QIO.resolve(10).delay(1000),
        QIO.resolve(20).delay(1000),
        QIO.resolve(30).delay(1000),
      ])

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })

    it('should maintain order', () => {
      const io = QIO.parN(3, [
        QIO.resolve(10),
        QIO.resolve(20),
        QIO.resolve(30),
      ])

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })

    it('should run max N IOs in parallel', () => {
      const ID = QIO.runtime().chain(QIO.encase((RTM) => RTM.scheduler.now()))

      const io = QIO.parN(1, [ID.delay(10), ID.delay(20), ID.delay(30)])

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(io)
      const expected = [11, 31, 61]

      assert.deepStrictEqual(actual, expected)
    })

    it('should run all when concurrency is set to Infinity', () => {
      const ID = QIO.runtime().chain(QIO.encase((RTM) => RTM.scheduler.now()))

      const io = QIO.parN(Infinity, [ID.delay(10), ID.delay(20), ID.delay(30)])

      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(io)
      const expected = [11, 21, 31]

      assert.deepStrictEqual(actual, expected)
    })

    it('should return empty array', () => {
      const io = QIO.parN(Infinity, [])
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(io)

      assert.deepStrictEqual(actual, [])
    })
  })

  describe('uninterruptible', () => {
    it('should capture exceptions from uninterruptibleIO API', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.uninterruptible<[], Error>((res, rej) => rej(new Error('Failed')))
      )
      const expected = new Error('Failed')

      assert.deepStrictEqual('' + String(actual), '' + String(expected))
    })

    it('should capture sync exceptions', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        QIO.uninterruptible((cb) => {
          throw new Error('Failed')
        })
      )
      const expected = new Error('Failed')

      assert.deepStrictEqual('' + String(actual), '' + String(expected))
    })

    it('should capture success results', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        // tslint:disable-next-line: no-null-keyword
        QIO.uninterruptible<number>((res, rej) => res(1000))
      )

      assert.deepStrictEqual(actual, 1000)
    })
  })

  describe('runtime', () => {
    it('should give access to current runtime', () => {
      const runtime = testRuntime()

      const actual = runtime.unsafeExecuteSync(QIO.runtime())

      assert.strictEqual(actual, runtime)
    })
  })

  describe('asEither', () => {
    context('when succeeds', () => {
      it('should return a Right', () => {
        const actual = testRuntime().unsafeExecuteSync(QIO.resolve(10).asEither)
        const expected = Either.right(10)
        assert.deepStrictEqual(actual, expected)
      })
    })
    context('when fails', () => {
      it('should return a Left', () => {
        const actual = testRuntime().unsafeExecuteSync(QIO.reject(100).asEither)
        const expected = Either.left(100)
        assert.deepStrictEqual(actual, expected)
      })
    })
  })
})
