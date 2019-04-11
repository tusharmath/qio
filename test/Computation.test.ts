/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {scheduler} from 'ts-scheduler'

import {IO} from '../'

import {IOCollector} from './internals/IOCollector'
import {
  createRejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('Computation', () => {
  ResolvingIOSpec(() => IO.from((rej, res) => res(10)))
  createRejectingIOSpec(() => IO.from(rej => rej(new Error('FAILED'))))

  const sh = scheduler
  it('should defer computations', async () => {
    const noop = () => {}
    const results: string[] = []
    const a = IO.from<void>((rej, res) => {
      results.push('RUN')
      res(undefined)

      return () => results.push('STOP')
    })

    // issue a cancelled IO
    a.fork(sh, noop, noop)()
    assert.deepEqual(results, [])
  })
  it('should handle sync exceptions', cb => {
    IO.from(() => {
      throw new Error('Waka')
    }).fork(
      sh,
      e => {
        assert.equal(e.message, 'Waka')
        cb()
      },
      () => {}
    )
  })
  it('should not cancel a resolved io', cb => {
    let cancelled = false
    const cancel = IO.from((rej, res) => {
      const id = setTimeout(res, 0, 100)

      return () => {
        clearTimeout(id)
        cancelled = true
      }
    }).fork(sh, cb, data => {
      cancel()
      assert.equal(data, 100)
      assert.isFalse(cancelled)
      cb()
    })
  })
  it('should not cancel a rejected io', cb => {
    let cancelled = false
    const cancel = IO.from((rej, res) => {
      const id = setTimeout(rej, 0, new Error('YO!'))

      return () => {
        clearTimeout(id)
        cancelled = true
      }
    }).fork(
      sh,
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
    let count = 1000
    const io = IO.from(() => () => (count += 1))
    const {scheduler: S, fork} = IOCollector(io)
    S.runTo(200)
    const cancel = fork()
    S.runTo(210)
    cancel()
    cancel()
    cancel()
    assert.strictEqual(count, 1001)
  })
})
