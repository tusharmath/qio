/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {FIO} from '../'
import {NoEnv} from '../src/envs/NoEnv'

import {GetTimeline} from './internals/GetTimeline'

describe('race', () => {
  it('should resolve with fastest io', () => {
    const a = FIO.from<NoEnv, never, string>((env, rej, res) => {
      res('A')

      return () => {}
    })
    const b = FIO.never()
    const actual = GetTimeline(a.race(b)).getValue()
    const expected = 'A'
    assert.equal(actual, expected)
  })
  it('should ignore rejections once resolved', () => {
    const error = new Error('B')
    const io = FIO.of('A').race(FIO.reject(error).delay(10))

    const actual = GetTimeline(io).getValue()
    const expected = 'A'

    assert.strictEqual(actual, expected)
  })
  it('should ignore resolutions once rejected', () => {
    const scheduler = testScheduler()
    const error = new Error('A')
    const a = FIO.reject(error)
    const b = FIO.of('B')
    a.race(b).fork(
      {scheduler},
      err => assert.equal(error, err),
      value => assert.fail('Should not resolve: ' + value)
    )
  })
  it('should cancel the second io on resolution of one', () => {
    let cancelled = 0
    const a = FIO.from(() => () => (cancelled = cancelled + 1))
    const b = FIO.of(100)
    const result = GetTimeline(a.race(b)).getValue()
    assert.equal(result, 100)
    assert.equal(cancelled, 1)
  })
  it('should cancel the second io on rejection of one', () => {
    let cancelled = 0
    const a = FIO.from(() => () => (cancelled = cancelled + 1))
    const b = FIO.reject(new Error('YO'))
    const message = GetTimeline(a.race(b)).getError().message
    assert.equal(message, 'YO')
    assert.equal(cancelled, 1)
  })
})
