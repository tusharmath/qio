/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'

import {
  createRejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('flatMap', () => {
  it('should flatten the value', async () => {
    const actual = await IO.of(10)
      .chain((i: number) => IO.of(i + 1))
      .toPromise()
    const expected = 11
    assert.equal(actual, expected)
  })
  ResolvingIOSpec(() => IO.of(10).chain(i => IO.of(100)))
  createRejectingIOSpec(() =>
    IO.of(10).chain(i => IO.reject(new Error('FAILED')))
  )
})
