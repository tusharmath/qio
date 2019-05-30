/**
 * Created by tushar on 2019-05-24
 */
import {assert} from 'chai'

import {FIO} from '../src/main/FIO'
import {defaultRuntime} from '../src/runtimes/DefaultRuntime'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('FIO', () => {
  describe('of', () => {
    it('should evaluate to a constant value', () => {
      const actual = testRuntime({count: 1000}).executeSync(FIO.of(1000))
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('map', () => {
    it('should map over the value', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.of(1000).map(i => i + 1)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('access', () => {
    it('should access a value and transform', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.access(env => env.count)
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('accessM', () => {
    it('should purely access the env', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.accessM(env => FIO.of(env.count))
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('chain', () => {
    it('should sequence the operations', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.of(1000).chain(FIO.of)
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('reject', () => {
    it('should sequence the operations', () => {
      assert.throws(() => {
        testRuntime({count: 1000}).executeSync(FIO.reject(new Error('WTF')))
      }, /WTF/)
    })
  })

  describe('async', () => {
    it('should evaluate asynchronously', async () => {
      const actual = await defaultRuntime({count: 1000}).executePromise(
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
      const runtime = testRuntime({count: 1000})
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
      const actual = await defaultRuntime({count: 1000}).executePromise(
        FIO.accessP(env => Promise.resolve(env.count))
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('try', () => {
    it('should call the cb function', () => {
      let i = 1000
      const actual = testRuntime({count: 1000}).executeSync(FIO.try(() => ++i))
      const expected = 1001
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      let actual = 1000
      const runtime = testRuntime({count: 1000})
      runtime.execute(FIO.try(() => ++actual)).cancel()
      runtime.scheduler.run()
      const expected = 1000
      assert.strictEqual(actual, expected)
    })
  })

  describe('and', () => {
    it('should chain two IOs', () => {
      const M = new Array<string>()
      testRuntime({count: 1000}).executeSync(
        FIO.try(() => M.push('A')).and(FIO.try(() => M.push('B')))
      )
      const actual = M
      const expected = ['A', 'B']
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('timeout', () => {
    it('should emit the provided value', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.timeout('Happy', 100)
      )

      const expected = 'Happy'
      assert.strictEqual(actual, expected)
    })
    it('should emit after the provided duration', () => {
      const runtime = testRuntime({count: 1000})
      runtime.executeSync(FIO.timeout('Happy', 100))
      const actual = runtime.scheduler.now()
      const expected = 101
      assert.strictEqual(actual, expected)
    })
  })

  describe('delay', () => {
    it('should delay the io execution', () => {
      let executedAt = -1
      const runtime = testRuntime({count: 1000})
      runtime.executeSync(
        FIO.try(() => (executedAt = runtime.scheduler.now())).delay(1000)
      )

      const expected = 1001
      assert.strictEqual(executedAt, expected)
    })
    it('should emit after the provided duration', () => {
      const runtime = testRuntime({count: 1000})
      runtime.executeSync(FIO.timeout('Happy', 100))
      const actual = runtime.scheduler.now()
      const expected = 101
      assert.strictEqual(actual, expected)
    })

    it('should be cancellable', () => {
      let executed = false
      const runtime = testRuntime({count: 1000})
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
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.encase((a: number, b: number) => a + b)(1, 1000)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('encaseP', () => {
    it('should resolve the encased function', async () => {
      const actual = await defaultRuntime({count: 1000}).executePromise(
        FIO.encaseP((a: number, b: number) => Promise.resolve(a + b))(1, 1000)
      )
      const expected = 1001
      assert.strictEqual(actual, expected)
    })
  })

  describe('never', () => {
    it('should never resolve/reject', () => {
      const actual = testRuntime({count: 1000}).executeSync(FIO.never())
      const expected = undefined
      assert.strictEqual(actual, expected)
    })
  })

  describe('catch', () => {
    it('should capture exceptions', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.reject(new Error('Bye')).catch(err => FIO.of(err.message))
      )
      const expected = 'Bye'
      assert.strictEqual(actual, expected)
    })

    it('should capture async exceptions', () => {
      const actual = testRuntime({count: 1000}).executeSync(
        FIO.asyncTask((rej, res, sh) => sh.asap(rej, new Error('Bye'))).catch(
          err => FIO.of(err.message)
        )
      )
      const expected = 'Bye'
      assert.strictEqual(actual, expected)
    })

    it('should capture nested async exceptions', () => {
      const actual = testRuntime({count: 1000}).executeSync(
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
    class Counter {
      public count = 0
      public inc = () => FIO.uio(() => ++this.count)
    }
    it('should return a memoized IO', () => {
      const counter = new Counter()
      const runtime = testRuntime({color: 'Green'})
      runtime.executeSync(
        counter
          .inc()
          .once()
          .chain(_ => _.and(_))
      )

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })

    it('should run only once for async io', () => {
      const counter = new Counter()
      const runtime = testRuntime({color: 'Green'})
      const memoized = runtime.executeSync(
        counter
          .inc()
          .delay(100)
          .once()
      )

      // Schedule first run at 10ms
      runtime.scheduler.runTo(10)
      runtime.execute(memoized as FIO)

      // Schedule second run at 50ms
      runtime.scheduler.runTo(50)
      runtime.execute(memoized as FIO)

      runtime.scheduler.run()

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })
})
