/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'

import {IOCollector} from './internals/IOCollector'

describe('and', () => {
  it('should resolve multiple ios', async () => {
    const actual = await IO.of('AAA')
      .and(IO.of('BBB'))
      .toPromise()

    const expected = ['AAA', 'BBB']
    assert.deepEqual(actual, expected)
  })
  it('should resolve multiple ios with different types', async () => {
    const actual = await IO.of('AAA')
      .and(IO.of(1))
      .toPromise()

    const expected = ['AAA', 1]
    assert.deepEqual(actual, expected)
  })

  it('should cancel the second io if one of them is rejected', async () => {
    let cancelled = 0
    const a = IO.from<never>(() => () => (cancelled = cancelled + 1))
    const b = IO.reject(new Error('Waka'))
    const err = await a
      .and(b)
      .toPromise()
      .catch((e: Error) => e)
    assert.equal(err.message, 'Waka')
    assert.equal(cancelled, 1)
  })

  it('should cancel the second io if one of them is rejected (TEST_SCHEDULER)', async () => {
    let cancelled = 0
    const a = IO.from<never>(() => () => (cancelled = cancelled + 1))
    const b = IO.from((rej, res, sh) =>
      sh.delay(() => rej(new Error('Save Me!')), 100)
    )
    const {scheduler, fork} = IOCollector(a.and(b))
    scheduler.runTo(10)
    fork()
    scheduler.runTo(111)
    assert.equal(cancelled, 1)
  })
})
