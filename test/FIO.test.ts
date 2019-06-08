/**
 * Created by tushar on 2019-05-24
 */

import {assert} from 'chai'

import {Await} from '../src/main/Await'
import {Exit} from '../src/main/Exit'
import {Fiber} from '../src/main/Fiber'
import {FIO, UIO} from '../src/main/FIO'
import {defaultRuntime} from '../src/runtimes/DefaultRuntime'
import {testRuntime} from '../src/runtimes/TestRuntime'

import {Counter} from './internals/Counter'

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
        FIO.access((env: {count: number}) => env.count).provide({count: 1000})
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('accessM', () => {
    it('should purely access the env', () => {
      const actual = testRuntime().executeSync(
        FIO.accessM((env: {count: number}) => FIO.of(env.count)).provide({
          count: 1000
        })
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('chain', () => {
    it('should sequence the operations', () => {
      const actual = testRuntime().executeSync(FIO.of(1000).chain(FIO.of))
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('reject', () => {
    it('should sequence the operations', () => {
      assert.throws(() => {
        testRuntime().executeSync(FIO.reject(new Error('WTF')))
      }, /WTF/)
    })
  })

  describe('async', () => {
    it('should evaluate asynchronously', async () => {
      const actual = await defaultRuntime().executePromise(
        FIO.async((env, rej, res) => {
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
        FIO.async(() => ({cancel: () => (cancelled = true)}))
      )
      runtime.scheduler.runTo(50)
      cancellable.cancel()
      assert.ok(cancelled, 'Cancelled should be true')
    })
  })

  describe('accessP', () => {
    it('should access promise based envs', async () => {
      const actual = await defaultRuntime().executePromise(
        FIO.accessP((env: {count: number}) =>
          Promise.resolve(env.count)
        ).provide({count: 1000})
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
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
          FIO.of(10).fork.chain(fiber => fiber.resume())
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
            .fork.chain(fiber => fiber.resume().delay(100))
        )

        const expected = 1
        assert.strictEqual(actual, expected)
        assert.strictEqual(runtime.scheduler.now(), 1101)
      })

      it('should bubble the env', () => {
        const actual = testRuntime().executeSync(
          FIO.access((_: {color: string}) => _.color)
            .fork.chain(fiber => fiber.resume())
            .provide({color: 'BLUE'})
        )

        const expected = 'BLUE'
        assert.strictEqual(actual, expected)
      })

      it('should resolve after the IO is completed', () => {
        const counter = new Counter()
        const runtime = testRuntime()
        runtime.execute(
          FIO.of(10)
            .delay(100)
            .fork.chain(fib => fib.resume().and(counter.inc()))
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
          counter.inc().fork.chain(fiber => fiber.abort())
        )

        assert.strictEqual(counter.count, 0)
      })

      it('should abort a throwing fiber', () => {
        const counter = new Counter()
        testRuntime().executeSync(
          FIO.reject(new Error('Fail'))
            .catch(() => counter.inc())
            .fork.chain(fiber => fiber.abort())
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

      it('should return the same fiber', () => {
        const actual = testRuntime().executeSync(
          FIO.void().fork.chain(fiber =>
            fiber.resumeAsync(FIO.void).map(_ => _ === fiber)
          )
        )

        assert.isTrue(actual)
      })

      it('should call with  Exit.success', () => {
        const actual = testRuntime().executeSync(
          Await.of<never, Exit<never, string>>().chain(await =>
            FIO.of('Hi').fork.chain(fiber =>
              fiber
                .resumeAsync(status => await.set(FIO.of(status)).void)
                .and(await.get())
            )
          )
        )

        const expected = Exit.success('Hi')
        assert.deepEqual(actual, expected)
      })

      it('should call with  Exit.failure', () => {
        const actual = testRuntime().executeSync(
          Await.of<never, Exit<string, never>>().chain(await =>
            FIO.reject('Hi').fork.chain(fiber =>
              fiber
                .resumeAsync(status => await.set(FIO.of(status)).void)
                .and(await.get())
            )
          )
        )

        const expected = Exit.failure('Hi')
        assert.deepEqual(actual, expected)
      })
    })
  })

  describe('provide', () => {
    it('should provide the env to FIO', () => {
      const actual = testRuntime().executeSync(
        FIO.access((_: {color: string}) => _.color).provide({color: 'Red'})
      )
      const expected = 'Red'
      assert.strictEqual(actual, expected)
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

      assert.deepEqual(actual, [Exit.success(10), Exit.success(20)])
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
      assert.deepEqual(actual, [Exit.success(10), Exit.success(20)])
    })
  })

  describe('raceWith', () => {
    it('should run in parallel', () => {
      const counter = new Counter()

      const a = FIO.timeout('A', 1000)
      const b = FIO.timeout('B', 2000)

      const runtime = testRuntime()
      runtime.execute(a.raceWith(b, FIO.void, FIO.void).and(counter.inc()))
      runtime.scheduler.runTo(10)

      assert.strictEqual(counter.count, 1)
    })
  })
})
