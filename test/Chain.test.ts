/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {FIO} from '../'

import {GetTimeline} from './internals/GetTimeline'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec,
  StackSafetySpec
} from './internals/IOSpecification'

describe('chain()', () => {
  it('should flatten the value', () => {
    const actual = GetTimeline(
      FIO.of(10).chain((i: number) => FIO.of(i + 1))
    ).getValue()

    const expected = 11
    assert.equal(actual, expected)
  })
  ResolvingIOSpec(() => FIO.of(10).chain(i => FIO.of(100)))
  RejectingIOSpec(() => FIO.of(10).chain(i => FIO.reject(new Error('FAILED'))))
  RejectingIOSpec(() =>
    FIO.of(10).chain(() => {
      throw new Error('FAILED')
    })
  )
  CancellationIOSpec(cancellable => FIO.of(10).chain(() => cancellable))
  CancellationIOSpec(cancellable => cancellable.chain(() => FIO.of(10)))
  StackSafetySpec(FIO.of(0), io => io.chain(_ => FIO.of(_ + 1)))
})
