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
        FIO.from((env, rej, res) => {
          setTimeout(res, 100, 1000)
        })
      )
      const expected = 1000
      assert.strictEqual(actual, expected)
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
})
