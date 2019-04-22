/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'

import {GetTimeline} from './internals/GetTimeline'
import {RejectingIOSpec} from './internals/IOSpecification'

describe('reject', () => {
  it('creates a rejected io', () => {
    const error = new Error('Bananas')
    const actual = GetTimeline(IO.reject(error)).getError().message
    const expected = error.message
    assert.strictEqual(actual, expected)
  })

  RejectingIOSpec(() => IO.reject(new Error('FAILED')))
})
