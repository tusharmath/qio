/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {scheduler as sh} from 'ts-scheduler'

import {IO} from '../'

describe('race', () => {
  it('should resolve with fastest io', async () => {
    const a = IO.from((rej, res) => {
      res('A')

      return () => {}
    })
    const b = IO.never()
    const actual = await a.race(b).toPromise()
    const expected = 'A'
    assert.equal(actual, expected)
  })
  it('should ignore rejections once resolved', () => {
    const error = new Error('B')
    const a = IO.of('A')
    const b = IO.reject(error)
    a.race(b).fork(
      sh,
      err => assert.fail('Should not throw: ' + err.message),
      value => assert.equal(value, 'A')
    )
  })
  it('should ignore resolutions once rejected', () => {
    const error = new Error('A')
    const a = IO.reject(error)
    const b = IO.of('B')
    a.race(b).fork(
      sh,
      err => assert.equal(error, err),
      value => assert.fail('Should not resolve: ' + value)
    )
  })
  it('should cancel the second io on resolution of one', async () => {
    let cancelled = 0
    const a = IO.from<never>(() => () => (cancelled = cancelled + 1))
    const b = IO.of(100)
    const result = await a.race(b).toPromise()
    assert.equal(result, 100)
    assert.equal(cancelled, 1)
  })
  it('should cancel the second io on rejection of one', async () => {
    let cancelled = 0
    const a = IO.from<never>(() => () => (cancelled = cancelled + 1))
    const b = IO.reject(new Error('YO'))
    const message = await a
      .race(b)
      .toPromise()
      .catch((err: Error) => err.message)
    assert.equal(message, 'YO')
    assert.equal(cancelled, 1)
  })
})
