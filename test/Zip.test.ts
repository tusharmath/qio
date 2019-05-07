/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {Cancel} from 'ts-scheduler'

import {FIO} from '../'
import {NoEnv} from '../src/envs/NoEnv'

import {GetTimeline} from './internals/GetTimeline'
import {IOCollector} from './internals/IOCollector'

describe('zip', () => {
  it('should resolve multiple ios', () => {
    const actual = GetTimeline(FIO.of('AAA').zip(FIO.of('BBB'))).getValue()

    const expected = ['AAA', 'BBB']
    assert.deepEqual(actual, expected)
  })
  it('should resolve multiple ios with different types', () => {
    const actual = GetTimeline(FIO.of('AAA').zip(FIO.of(1))).getValue()

    const expected = ['AAA', 1]
    assert.deepEqual(actual, expected)
  })

  it('should cancel the second io if one of them is rejected', () => {
    let cancelled = 0
    const a = FIO.from(() => () => (cancelled = cancelled + 1))
    const b = FIO.reject(new Error('Kudos'))
    const err = GetTimeline(a.zip(b)).getError()

    assert.equal(err.message, 'Kudos')
    assert.equal(cancelled, 1)
  })

  it('should cancel the second io if one of them is rejected (TEST_SCHEDULER)', () => {
    let cancelled = 0
    const {fork, runtime} = IOCollector(
      {},
      FIO.from(() => () => (cancelled = cancelled + 1)).zip(
        FIO.from<NoEnv, Error>(
          (env, rej): Cancel =>
            runtime.scheduler.delay(() => rej(new Error('Save Me!')), 100)
        )
      )
    )
    runtime.scheduler.runTo(10)
    fork()
    runtime.scheduler.runTo(111)
    assert.equal(cancelled, 1)
  })
})
