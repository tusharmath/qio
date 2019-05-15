/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {FIO} from '../'
import {NoEnv} from '../src/envs/NoEnv'

import {Counter} from './internals/Counter'
import {GetTimeline} from './internals/GetTimeline'
import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('Computation', () => {
  ResolvingIOSpec(() =>
    FIO.from<NoEnv, never, number>((env, rej, res) => res(10))
  )
  RejectingIOSpec(() =>
    FIO.from<NoEnv, Error>((env, rej) => rej(new Error('FAILED')))
  )

  it('should defer computations', () => {
    const results: string[] = []

    const {fork} = IOCollector(
      {scheduler: testScheduler()},
      FIO.from<NoEnv, never, void>((env, rej, res) => {
        results.push('RUN')
        res(undefined)

        return () => results.push('STOP')
      })
    )
    fork().cancel()

    // Issue a cancelled IO
    assert.deepEqual(results, [])
  })
  it('should handle sync exceptions', () => {
    const actual = GetTimeline(
      FIO.from<NoEnv, Error>(() => {
        throw new Error('APPLE')
      })
    ).getError().message
    const expected = 'APPLE'

    assert.strictEqual(actual, expected)
  })
  it('should not cancel a resolved io', () => {
    let cancelled = false
    const {fork, timeline, runtime} = IOCollector(
      undefined,
      FIO.from<NoEnv, never, number>((env, rej, res) => {
        const c = runtime.scheduler.delay({execute: () => res(100)}, 10)

        return () => {
          c.cancel()
          cancelled = true
        }
      })
    )
    const cancel = fork()
    runtime.scheduler.run()
    cancel.cancel()

    const actual = timeline.getValue()
    const expected = 100
    assert.strictEqual(actual, expected)
    assert.isFalse(cancelled)
  })
  it('should not cancel a rejected io', () => {
    let cancelled = false
    const {fork, timeline, runtime} = IOCollector(
      {},
      FIO.from<NoEnv, Error>((env, rej) => {
        const c = runtime.scheduler.delay(
          {execute: () => rej(new Error('Bup!'))},
          10
        )

        return () => {
          c.cancel()
          cancelled = true
        }
      })
    )
    const cancel = fork()
    runtime.scheduler.run()
    cancel.cancel()

    assert.equal(timeline.getError().message, 'Bup!')
    assert.isFalse(cancelled)
  })
  it('should not cancel a cancelled IO', () => {
    const counter = Counter(1000)
    const io = counter.inc
    const {fork, runtime} = IOCollector(undefined, io)
    runtime.scheduler.runTo(200)
    const cancel = fork()
    runtime.scheduler.runTo(210)
    cancel.cancel()
    cancel.cancel()
    cancel.cancel()
    assert.strictEqual(counter.getCount(), 1001)
  })
})
