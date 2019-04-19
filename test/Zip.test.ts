/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'
import {defaultEnv} from '../src/internals/DefaultEnv'

import {IOCollector} from './internals/IOCollector'

describe('zip', () => {
  const dC = IOCollector(defaultEnv)
  it('should resolve multiple ios', async () => {
    const actual = await IO.of('AAA')
      .zip(IO.of('BBB'))
      .toPromise(defaultEnv)

    const expected = ['AAA', 'BBB']
    assert.deepEqual(actual, expected)
  })
  it('should resolve multiple ios with different types', async () => {
    const actual = await IO.of('AAA')
      .zip(IO.of(1))
      .toPromise(defaultEnv)

    const expected = ['AAA', 1]
    assert.deepEqual(actual, expected)
  })

  it('should cancel the second io if one of them is rejected', async () => {
    let cancelled = 0
    const a = IO.from<never>(() => () => (cancelled = cancelled + 1))
    const b = IO.reject(new Error('Waka'))
    const err = await a
      .zip(b)
      .toPromise(defaultEnv)
      .catch((e: Error) => e)
    assert.equal(err.message, 'Waka')
    assert.equal(cancelled, 1)
  })

  it('should cancel the second io if one of them is rejected (TEST_SCHEDULER)', async () => {
    let cancelled = 0
    const a = IO.from<never>(() => () => (cancelled = cancelled + 1))
    const b = IO.from((sh, env, rej, res) =>
      sh.delay(() => rej(new Error('Save Me!')), 100)
    )
    const {scheduler, fork} = dC(a.zip(b))
    scheduler.runTo(10)
    fork()
    scheduler.runTo(111)
    assert.equal(cancelled, 1)
  })
})
