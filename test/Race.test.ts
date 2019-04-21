/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {scheduler} from 'ts-scheduler'

import {IO} from '../'
import {AnyEnv} from '../src/envs/AnyEnv'

import {GetTimeline} from './internals/GetTimeline'

describe('race', () => {
  it('should resolve with fastest io', () => {
    const a = IO.from<AnyEnv, string>((env, rej, res) => {
      res('A')

      return () => {}
    })
    const b = IO.never()
    const actual = GetTimeline(a.race(b)).getValue()
    const expected = 'A'
    assert.equal(actual, expected)
  })
  it('should ignore rejections once resolved', () => {
    const error = new Error('B')
    const a = IO.of('A')
    const b = IO.reject(error)
    a.race(b).fork(
      {scheduler},
      err => assert.fail('Should not throw: ' + err.message),
      value => assert.equal(value, 'A')
    )
  })
  it('should ignore resolutions once rejected', () => {
    const error = new Error('A')
    const a = IO.reject(error)
    const b = IO.of('B')
    a.race(b).fork(
      {scheduler},
      err => assert.equal(error, err),
      value => assert.fail('Should not resolve: ' + value)
    )
  })
  it('should cancel the second io on resolution of one', () => {
    let cancelled = 0
    const a = IO.from(() => () => (cancelled = cancelled + 1))
    const b = IO.of(100)
    const result = GetTimeline(a.race(b)).getValue()
    assert.equal(result, 100)
    assert.equal(cancelled, 1)
  })
  it('should cancel the second io on rejection of one', () => {
    let cancelled = 0
    const a = IO.from(() => () => (cancelled = cancelled + 1))
    const b = IO.reject(new Error('YO'))
    const message = GetTimeline(a.race(b)).getError().message
    assert.equal(message, 'YO')
    assert.equal(cancelled, 1)
  })
})
