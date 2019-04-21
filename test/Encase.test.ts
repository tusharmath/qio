/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'

import {GetTimeline} from './internals/GetTimeline'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('encase', () => {
  ResolvingIOSpec(() => IO.encase(() => 10)())
  RejectingIOSpec(() =>
    IO.encase(() => {
      throw new Error('FAILED')
    })()
  )

  it('should resolve to the return value of the function supplied', () => {
    const fetch = (...t: string[]) => t.join(',')
    const fetchF = IO.encase(fetch)
    const actual = GetTimeline(fetchF('a', 'b', 'c')).getValue()

    const expected = 'a,b,c'
    assert.equal(actual, expected)
  })

  it('should catch errors', () => {
    const errorF = IO.encase<string, []>(() => {
      throw new Error('Bup!')
    })
    const actual = GetTimeline(errorF()).getError().message

    const expected = 'Bup!'
    assert.equal(actual, expected)
  })
})
