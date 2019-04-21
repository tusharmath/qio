/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {scheduler} from 'ts-scheduler'
import {testScheduler} from 'ts-scheduler/test'

import {IO} from '../'
import {AnyEnv} from '../src/envs/AnyEnv'

import {Counter} from './internals/Counter'
import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('Computation', () => {
  ResolvingIOSpec(() => IO.from<AnyEnv, number>((env, rej, res) => res(10)))
  RejectingIOSpec(() => IO.from((env, rej, res) => rej(new Error('FAILED'))))

  it('should defer computations', async () => {
    const noop = () => {}
    const results: string[] = []
    const a = IO.from<AnyEnv, void>((env, rej, res) => {
      results.push('RUN')
      res(undefined)

      return () => results.push('STOP')
    })

    // Issue a cancelled IO
    a.fork({scheduler}, noop, noop)()
    assert.deepEqual(results, [])
  })
  it('should handle sync exceptions', cb => {
    IO.from(() => {
      throw new Error('APPLE')
    }).fork(
      {scheduler},
      e => {
        assert.equal(e.message, 'APPLE')
        cb()
      },
      () => {}
    )
  })
  it('should not cancel a resolved io', cb => {
    let cancelled = false
    const cancel = IO.from((env, rej, res) => {
      const id = setTimeout(res, 0, 100)

      return () => {
        clearTimeout(id)
        cancelled = true
      }
    }).fork({scheduler}, cb, data => {
      cancel()
      assert.equal(data, 100)
      assert.isFalse(cancelled)
      cb()
    })
  })
  it('should not cancel a rejected io', cb => {
    let cancelled = false
    const cancel = IO.from((env, rej, res) => {
      const id = setTimeout(rej, 0, new Error('YO!'))

      return () => {
        clearTimeout(id)
        cancelled = true
      }
    }).fork(
      {scheduler},
      err => {
        cancel()
        assert.equal(err.message, 'YO!')
        assert.isFalse(cancelled)
        cb()
      },
      cb
    )
  })
  it('should not cancel a cancelled IO', () => {
    const counter = Counter(1000)
    const io = counter.inc
    const S = testScheduler()
    const {fork} = IOCollector({scheduler: S}, io)
    S.runTo(200)
    const cancel = fork()
    S.runTo(210)
    cancel()
    cancel()
    cancel()
    assert.strictEqual(counter.getCount(), 1001)
  })
})
