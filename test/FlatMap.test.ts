/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'

import {GetTimeline} from './internals/GetTimeline'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('chain()', () => {
  it('should flatten the value', () => {
    const actual = GetTimeline(
      IO.of(10).chain((i: number) => IO.of(i + 1))
    ).getValue()

    const expected = 11
    assert.equal(actual, expected)
  })
  ResolvingIOSpec(() => IO.of(10).chain(i => IO.of(100)))
  RejectingIOSpec(() => IO.of(10).chain(i => IO.reject(new Error('FAILED'))))
  RejectingIOSpec(() =>
    IO.of(10).chain(() => {
      throw new Error('FAILED')
    })
  )
  CancellationIOSpec(cancellable => IO.of(10).chain(i => cancellable))
  CancellationIOSpec(cancellable => cancellable.chain(i => IO.of(10)))
})
