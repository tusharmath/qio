/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {scheduler as sh} from 'ts-scheduler'

import {IO} from '../'

import {createRejectingIOSpec} from './internals/IOSpecification'

describe('reject', () => {
  it('creates a rejected io', async () => {
    const error = new Error('Bananas')
    const actual = await IO.reject(error)
      .toPromise()
      .catch((err: Error) => 'ERR:' + err.message)
    const expected = 'ERR:' + error.message
    assert.strictEqual(actual, expected)
  })

  it('should abort rejected io', cb => {
    const error = new Error('Bananas')
    IO.reject(error).fork(sh, cb, cb)()
    cb()
  })

  createRejectingIOSpec(() => IO.reject(new Error('FAILED')))
})
