/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {FIO} from '../'

import {GetTimeline} from './internals/GetTimeline'
import {RejectingIOSpec} from './internals/IOSpecification'

describe('reject', () => {
  it('creates a rejected io', () => {
    const error = new Error('Bananas')
    const actual = GetTimeline(FIO.reject(error)).getError().message
    const expected = error.message
    assert.strictEqual(actual, expected)
  })

  RejectingIOSpec(() => FIO.reject(new Error('FAILED')))
})
