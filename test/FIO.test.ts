/**
 * Created by tushar on 2019-05-24
 */

import {assert} from 'chai'
import {Either} from 'standard-data-structures'

import {FiberContext} from '../src/internals/FiberContext'
import {Await} from '../src/main/Await'
import {Fiber} from '../src/main/Fiber'
import {FIO, UIO} from '../src/main/FIO'
import {defaultRuntime} from '../src/runtimes/DefaultRuntime'
import {IRuntime} from '../src/runtimes/IRuntime'
import {testRuntime} from '../src/runtimes/TestRuntime'

import {Counter} from './internals/Counter'
import {Snapshot} from './internals/Snapshot'

describe('FIO', () => {
  describe('of', () => {
    it('should evaluate to a constant value', () => {
      const actual = testRuntime().executeSync(FIO.of(1000))
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('map', () => {
    it('should map over the value', () => {
      const actual = testRuntime().executeSync(FIO.of(1000).map(i => i + 1))
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('access', () => {
    it('should access a value and transform', () => {
      const actual = testRuntime().executeSync(
        FIO.access((name: string) => name.length).provide('FIO')
      )
      const expected = 3
      assert.strictEqual(actual, expected)
    })
  })

  describe('reject', () => {
    it('should sequence the operations', () => {
      const actual = testRuntime().executeSync(
        FIO.reject(new Error('foo'))
      ) as Error
      const expected = 'foo'
      assert.deepEqual(actual.message, expected)
    })
  })

  describe('async', () => {
    it('should evaluate asynchronously', async () => {
      const actual = await defaultRuntime().executePromise(
        FIO.asyncIO((rej, res) => {
          const id = setTimeout(res, 100, 1000)

          return {cancel: () => clearTimeout(id)}
        })
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      let cancelled = false
      const runtime = testRuntime()
      const cancellable = runtime.execute(
        FIO.asyncIO(() => ({cancel: () => (cancelled = true)}))
      )
      runtime.scheduler.runTo(50)
      cancellable.cancel()
      assert.ok(cancelled, 'Cancelled should be true')
    })
  })

  describe('try', () => {
    it('should call the cb function', () => {
      let i = 1000
      const actual = testRuntime().executeSync(FIO.try(() => ++i))
      const expected = 1001
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      let actual = 1000
      const runtime = testRuntime()
      runtime.execute(FIO.try(() => ++actual)).cancel()
      runtime.scheduler.run()
      const expected = 1000
      assert.strictEqual(actual, expected)
    })

    it('should capture exceptions', () => {
      const actual = testRuntime().executeSync(
        FIO.try(() => {
          throw new Error('foo')
        }).catch(err => FIO.of(err.message + '-bar'))
      )
      const expected = 'foo-bar'
      assert.strictEqual(actual, expected)
    })

    it('should fail', () => {
      const actual = testRuntime().executeSync(
        FIO.try(() => {
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
      testRuntime().executeSync(
        FIO.try(() => M.push('A')).and(FIO.try(() => M.push('B')))
      )
      const actual = M
      const expected = ['A', 'B']
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('timeout', () => {
    it('should emit the provided value', () => {
      const actual = testRuntime().executeSync(FIO.timeout('Happy', 100))

      const expected = 'Happy'
      assert.strictEqual(actual, expected)
    })
    it('should emit after the provided duration', () => {
      const runtime = testRuntime()
      runtime.executeSync(FIO.timeout('Happy', 100))
      const actual = runtime.scheduler.now()
      const expected = 101
      assert.strictEqual(actual, expected)
    })
  })

  describe('delay', () => {
    it('should delay the io execution', () => {
      let executedAt = -1
      const runtime = testRuntime()
      runtime.executeSync(
        FIO.try(() => (executedAt = runtime.scheduler.now())).delay(1000)
      )

      const expected = 1001
      assert.strictEqual(executedAt, expected)
    })
    it('should emit after the provided duration', () => {
      const runtime = testRuntime()
      runtime.executeSync(FIO.timeout('Happy', 100))
      const actual = runtime.scheduler.now()
      const expected = 101
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      let executed = false
      const runtime = testRuntime()
      const cancellable = runtime.execute(
        FIO.try(() => (executed = true)).delay(100)
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
      const actual = testRuntime().executeSync(
        FIO.encase((a: number, b: number) => a + b)(1, 1000)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('encaseP', () => {
    it('should resolve the encased function', async () => {
      const actual = await defaultRuntime().executePromise(
        FIO.encaseP((a: number, b: number) => Promise.resolve(a + b))(1, 1000)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('never', () => {
    it('should never resolve/reject', () => {
      const actual = testRuntime().executeSync(FIO.never())
      const expected = undefined
      assert.strictEqual(actual, expected)
    })
  })

  describe('catch', () => {
    it('should capture exceptions', () => {
      const actual = testRuntime().executeSync(
        FIO.reject(new Error('Bye')).catch(err => FIO.of(err.message))
      )
      const expected = 'Bye'
      assert.strictEqual(actual, expected)
    })

    it('should capture async exceptions', () => {
      const actual = testRuntime().executeSync(
        FIO.asyncTask((rej, res, sh) => sh.asap(rej, new Error('Bye'))).catch(
          err => FIO.of(err.message)
        )
      )
      const expected = 'Bye'
      assert.strictEqual(actual, expected)
    })

    it('should capture nested async exceptions', () => {
      const actual = testRuntime().executeSync(
        FIO.asyncTask((rej, res, sh) => sh.asap(rej, new Error('A')))
          .catch(err => FIO.reject(new Error(err.message + 'B')))
          .catch(err => FIO.reject(new Error(err.message + 'C')))
          .catch(err => FIO.reject(new Error(err.message + 'D')))
          .catch(err => FIO.of(err.message + 'E'))
      )

      const expected = 'ABCDE'
      assert.strictEqual(actual, expected)
    })
  })

  describe('once', () => {
    it('should return a memoized IO', () => {
      const counter = new Counter()
      const runtime = testRuntime()
      runtime.executeSync(counter.inc().once.chain(_ => _.and(_)))

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })

    it('should run only once for async io', () => {
      const counter = new Counter()
      const runtime = testRuntime()
      const memoized = runtime.executeSync(counter.inc().delay(100).once)

      // Schedule first run at 10ms
      runtime.scheduler.runTo(10)
      runtime.execute(memoized as UIO<number>)

      // Schedule second run at 50ms
      runtime.scheduler.runTo(50)
      runtime.execute(memoized as UIO<number>)

      runtime.scheduler.run()

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })

  describe('fork', () => {
    it('should return an instance of Fiber', () => {
      const actual = testRuntime().executeSync(FIO.of(10).fork)
      assert.instanceOf(actual, Fiber)
    })

    it('should complete immediately', () => {
      const runtime = testRuntime()
      const counter = new Counter()
      runtime.execute(FIO.timeout('A', 1000).fork.and(counter.inc()))
      runtime.scheduler.runTo(10)
      assert.isTrue(counter.increased)
    })

    describe('fiber.resume', () => {
      it('should not run forked fibers', () => {
        const runtime = testRuntime()
        const counter = new Counter()
        const actual = runtime.executeSync(counter.inc().fork.chain(FIO.never))

        assert.isUndefined(actual)
        assert.strictEqual(counter.count, 0)
      })

      it('should resume with the io', () => {
        const actual = testRuntime().executeSync(
          FIO.of(10).fork.chain(fiber => fiber.resume)
        )

        const expected = 10
        assert.strictEqual(actual, expected)
      })

      it('should resume async io', () => {
        const a = new Counter()
        const runtime = testRuntime()
        const actual = runtime.executeSync(
          a
            .inc()
            .delay(1000)
            .fork.chain(fiber => fiber.resume.delay(100))
        )

        const expected = 1
        assert.strictEqual(actual, expected)
        assert.strictEqual(runtime.scheduler.now(), 1101)
      })

      it('should resolve after the IO is completed', () => {
        const counter = new Counter()
        const runtime = testRuntime()
        runtime.execute(
          FIO.of(10)
            .delay(100)
            .fork.chain(fib => fib.resume.and(counter.inc()))
        )
        runtime.scheduler.runTo(50)

        const actual = counter.count
        const expected = 0
        assert.deepEqual(actual, expected)
      })
    })

    describe('fiber.abort', () => {
      it('should abort the fiber', () => {
        const counter = new Counter()
        testRuntime().executeSync(
          counter.inc().fork.chain(fiber => fiber.abort)
        )

        assert.strictEqual(counter.count, 0)
      })

      it('should abort a throwing fiber', () => {
        const counter = new Counter()
        testRuntime().executeSync(
          FIO.reject(new Error('Fail'))
            .catch(() => counter.inc())
            .fork.chain(fiber => fiber.abort)
        )

        assert.strictEqual(counter.count, 0)
      })
    })

    describe('fiber.resumeAsync', () => {
      it('should asynchronously execute the IO', () => {
        const a = new Counter()
        const runtime = testRuntime()
        runtime.execute(
          a
            .inc()
            .delay(1000)
            .fork.chain(fiber => fiber.resumeAsync(FIO.void))
        )
        runtime.scheduler.runTo(50)

        assert.strictEqual(a.count, 0)
      })

      it('should complete without waiting', () => {
        const a = new Counter()
        const runtime = testRuntime()
        runtime.execute(
          FIO.timeout(0, 1000).fork.chain(fiber =>
            fiber.resumeAsync(FIO.void).and(a.inc())
          )
        )
        runtime.scheduler.runTo(10)

        assert.strictEqual(a.count, 1)
      })

      it('should return void', () => {
        const actual = testRuntime().executeSync(
          FIO.void().fork.chain(fiber => fiber.resumeAsync(FIO.void))
        )

        assert.isUndefined(actual)
      })

      it('should call with  Either.success', () => {
        const actual = testRuntime().executeSync(
          Await.of<never, Either<never, string>>().chain(await =>
            FIO.of('Hi').fork.chain(fiber =>
              fiber
                .resumeAsync(status => await.set(FIO.of(status)).void)
                .and(await.get)
            )
          )
        )

        const expected = Either.right('Hi')
        assert.deepEqual(actual, expected)
      })

      it('should call with  Either.failure', () => {
        const actual = testRuntime().executeSync(
          Await.of<never, Either<string, never>>().chain(await =>
            FIO.reject('Hi').fork.chain(fiber =>
              fiber
                .resumeAsync(status => await.set(FIO.of(status)).void)
                .and(await.get)
            )
          )
        )

        const expected = Either.left('Hi')
        assert.deepEqual(actual, expected)
      })
    })
  })

  describe('zipWith', () => {
    it('should sequentially combine two FIO', () => {
      const actual = testRuntime().executeSync(
        FIO.of(10).zipWith(FIO.of(20), (a, b) => a + b)
      )
      const expected = 30
      assert.strictEqual(actual, expected)
    })
  })

  describe('zipWithPar', () => {
    it('should combine two IO', () => {
      const actual = testRuntime().executeSync(
        FIO.of(10).zipWithPar(FIO.of(20), (a, b) => [a, b])
      )

      assert.deepEqual(actual, [10, 20])
    })

    it('should combine them in parallel', () => {
      const left = FIO.of(10).delay(1500)
      const right = FIO.of(20).delay(1000)
      const runtime = testRuntime()
      runtime.executeSync(left.zipWithPar(right, (a, b) => [a, b]))

      const actual = runtime.scheduler.now()
      assert.strictEqual(actual, 1501)
    })

    it('should output the result', () => {
      const left = FIO.of(10).delay(1500)
      const right = FIO.of(20).delay(1000)
      const runtime = testRuntime()

      const actual = runtime.executeSync(
        left.zipWithPar(right, (a, b) => [a, b])
      )
      assert.deepEqual(actual, [10, 20])
    })

    it('should abort the pending one on error', () => {
      const counter = new Counter()
      const left = FIO.reject(10).delay(500)
      const right = counter.inc().delay(1000)
      const runtime = testRuntime()

      runtime.executeSync(left.zipWithPar(right, (a, b) => [a, b]))
      assert.deepEqual(counter.count, 0)
    })
  })

  describe('raceWith', () => {
    it('should run in parallel', () => {
      const snapshot = new Snapshot()

      const a = snapshot.mark('A').delay(1000)
      const b = snapshot.mark('B').delay(2000)

      testRuntime().executeSync(a.raceWith(b, FIO.void, FIO.void))

      assert.deepEqual(snapshot.timeline, ['A@1001', 'B@2001'])
    })

    it('should complete when either of them', () => {
      const snapshot = new Snapshot()

      const a = snapshot.mark('A').delay(1000)
      const b = snapshot.mark('B').delay(2000)

      testRuntime().executeSync(
        a.raceWith(b, FIO.void, FIO.void).and(snapshot.mark('C'))
      )

      assert.deepEqual(snapshot.timeline, ['A@1001', 'C@1001', 'B@2001'])
    })

    it('should call both cbs', () => {
      const snapshot = new Snapshot()

      const a = FIO.of('A').delay(1000)
      const b = FIO.of('B').delay(2000)

      testRuntime().executeSync(
        a.raceWith(b, () => snapshot.mark('A'), () => snapshot.mark('B'))
      )

      assert.deepEqual(snapshot.timeline, ['A@1001', 'B@2001'])
    })

    it('should return the output', () => {
      const a = FIO.of('A').delay(1000)
      const b = FIO.of('B').delay(2000)

      const actual = testRuntime().executeSync(
        a.raceWith(b, () => FIO.of(10), () => FIO.of(20))
      )

      assert.strictEqual(actual, 10)
    })
  })

  describe('provide', () => {
    it('should maintain env for multiple access', () => {
      const actual = testRuntime().executeSync(
        FIO.access((_: string) => _)
          .chain(s => FIO.access((_: string) => _ + '-' + s))
          .provide('FIO')
      )
      const expected = 'FIO-FIO'

      assert.strictEqual(actual, expected)
    })

    it('should handle nested provides', () => {
      const actual = testRuntime().executeSync(
        FIO.access((_: string) => _.length)
          .chain(a => FIO.access((b: number) => b + a).provide(100))
          .provide('FIO')
      )
      const expected = 103

      assert.strictEqual(actual, expected)
    })

    it('should handle multiple accesses', () => {
      const actual = testRuntime().executeSync(
        FIO.access((_: string) => _.length)
          .fork.chain(_ => _.resume)
          .provide('ABCD')
      )

      const expected = 4
      assert.deepStrictEqual(actual, expected)
    })

    it('should remove from env stack (memory leak)', () => {
      const actual = testRuntime().executeSync(
        FIO.access((_: string) => _.length)
          .provide('FIO')
          .fork.chain(f =>
            f.resume.map(() => (f as FiberContext).stackEnv.length)
          )
      )
      const expected = 0

      assert.strictEqual(actual, expected)
    })

    it('should provide env to async functions', () => {
      const actual = testRuntime().executeSync(
        FIO.access((_: number) => _ + 1)
          .delay(1000)
          .provide(10)
      )
      const expected = 11

      assert.strictEqual(actual, expected)
    })
  })

  describe('par', () => {
    it('should run the IO in parallel', () => {
      const io = FIO.par([
        FIO.of(10).delay(1000),
        FIO.of(20).delay(1000),
        FIO.of(30).delay(1000)
      ])

      const actual = testRuntime().executeSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })

    it('should maintain order', () => {
      const io = FIO.par([FIO.of(10), FIO.of(20), FIO.of(30)])

      const actual = testRuntime().executeSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('parN', () => {
    it('should run the IO in parallel', () => {
      const io = FIO.parN(3, [
        FIO.of(10).delay(1000),
        FIO.of(20).delay(1000),
        FIO.of(30).delay(1000)
      ])

      const actual = testRuntime().executeSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })

    it('should maintain order', () => {
      const io = FIO.parN(3, [FIO.of(10), FIO.of(20), FIO.of(30)])

      const actual = testRuntime().executeSync(io)
      const expected = [10, 20, 30]

      assert.deepStrictEqual(actual, expected)
    })

    it('should run max N IOs in parallel', () => {
      const ID = FIO.runtime().chain(FIO.encase(RTM => RTM.scheduler.now()))

      const io = FIO.parN(1, [ID.delay(10), ID.delay(20), ID.delay(30)])

      const actual = testRuntime().executeSync(io)
      const expected = [11, 31, 61]

      assert.deepStrictEqual(actual, expected)
    })

    it('should run all when concurrency is set to Infinity', () => {
      const ID = FIO.runtime().chain(FIO.encase(RTM => RTM.scheduler.now()))

      const io = FIO.parN(Infinity, [ID.delay(10), ID.delay(20), ID.delay(30)])

      const actual = testRuntime().executeSync(io)
      const expected = [11, 21, 31]

      assert.deepStrictEqual(actual, expected)
    })

    it('should return empty array', () => {
      const io = FIO.parN(Infinity, [])
      const actual = testRuntime().executeSync(io)

      assert.deepStrictEqual(actual, [])
    })
  })

  describe('node', () => {
    it('should capture exceptions from Node API', () => {
      const actual = testRuntime().executeSync(
        FIO.node(cb => cb(new Error('Failed')))
      )
      const expected = new Error('Failed')

      assert.deepStrictEqual('' + String(actual), '' + String(expected))
    })

    it('should capture sync exceptions', () => {
      const actual = testRuntime().executeSync(
        FIO.node(cb => {
          throw new Error('Failed')
        })
      )
      const expected = new Error('Failed')

      assert.deepStrictEqual('' + String(actual), '' + String(expected))
    })

    it('should capture success results', () => {
      const actual = testRuntime().executeSync(
        // tslint:disable-next-line: no-null-keyword
        FIO.node<number>(cb => cb(null, 1000))
      )
      const expected = 1000

      assert.strictEqual(actual, expected)
    })
  })

  describe('runtime', () => {
    it('should give access to current runtime', () => {
      const runtime = testRuntime()

      const actual = runtime.executeSync(FIO.runtime())

      assert.strictEqual(actual, runtime as IRuntime)
    })
  })
})
