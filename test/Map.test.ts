/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'

import {IO} from '../'

import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('map', () => {
  it('should convert the value', async () => {
    const actual = await IO.of(10)
      .map((i: number) => i + 1)
      .toPromise()
    const expected = 11
    assert.equal(actual, expected)
  })
  ResolvingIOSpec(() => IO.of(10).map(i => 100))
  RejectingIOSpec(() =>
    IO.of(10).map(i => {
      throw new Error('FAILED')
    })
  )
})
