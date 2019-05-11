/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'

import {FIO} from '../'

import {Counter} from './internals/Counter'
import {GetTimeline} from './internals/GetTimeline'
import {
  RejectingIOSpec,
  ResolvingIOSpec,
  StackSafetySpec
} from './internals/IOSpecification'

describe('map', () => {
  it('should convert the value', () => {
    const actual = GetTimeline(FIO.of(10).map((i: number) => i + 1)).getValue()
    const expected = 11
    assert.equal(actual, expected)
  })
  it('should capture exceptions on resolve', () => {
    const counter = Counter()
    const timeline = GetTimeline(
      counter.inc.map(() => {
        throw new Error('FAILURE')
      })
    )
    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 1, 'Error: FAILURE'])

    assert.deepStrictEqual(actual, expected)
  })
  ResolvingIOSpec(() => FIO.of(10).map(i => 100))
  RejectingIOSpec(() =>
    FIO.of(10).map(() => {
      throw new Error('FAILED')
    })
  )
  StackSafetySpec(FIO.of(0), io => io.map(_ => _ + 1).map(_ => _ / 2))
})
