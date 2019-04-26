/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {IO} from '../'
import {AnyEnv} from '../src/envs/AnyEnv'
import {SchedulerEnv} from '../src/envs/SchedulerEnv'

import {Counter} from './internals/Counter'
import {GetTimeline} from './internals/GetTimeline'
import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('Computation', () => {
  ResolvingIOSpec(() => IO.from((env, rej, res) => res(10)))
  RejectingIOSpec(() => IO.from((env, rej) => rej(new Error('FAILED'))))

  it('should defer computations', () => {
    const results: string[] = []

    const {fork} = IOCollector(
      {scheduler: testScheduler()},
      IO.from<AnyEnv, void>((env, rej, res) => {
        results.push('RUN')
        res(undefined)

        return () => results.push('STOP')
      })
    )
    fork()()

    // Issue a cancelled IO
    assert.deepEqual(results, [])
  })
  it('should handle sync exceptions', () => {
    const actual = GetTimeline(
      IO.from(() => {
        throw new Error('APPLE')
      })
    ).getError().message
    const expected = 'APPLE'

    assert.strictEqual(actual, expected)
  })
  it('should not cancel a resolved io', () => {
    let cancelled = false
    const scheduler = testScheduler()
    const io = IO.from<SchedulerEnv, number>((env, rej, res) => {
      const c = env.scheduler.delay(() => res(100), 10)

      return () => {
        c()
        cancelled = true
      }
    })
    const {fork, timeline} = IOCollector({scheduler}, io)
    const cancel = fork()
    scheduler.run()
    cancel()

    const actual = timeline.getValue()
    const expected = 100
    assert.strictEqual(actual, expected)
    assert.isFalse(cancelled)
  })
  it('should not cancel a rejected io', () => {
    let cancelled = false
    const io = IO.from<SchedulerEnv>((env, rej) => {
      const c = env.scheduler.delay(() => rej(new Error('Bup!')), 10)

      return () => {
        c()
        cancelled = true
      }
    })
    const scheduler = testScheduler()
    const {fork, timeline} = IOCollector({scheduler}, io)
    const cancel = fork()
    scheduler.run()
    cancel()

    assert.equal(timeline.getError().message, 'Bup!')
    assert.isFalse(cancelled)
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
