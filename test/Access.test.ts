/**
 * Created by tushar on 2019-03-18
 */
import * as assert from 'assert'

import {FIO} from '../'

import {ForkNRun} from './internals/ForkNRun'
import {GetTimeline} from './internals/GetTimeline'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('access()', () => {
  ResolvingIOSpec(() => FIO.access(() => void 0))
  RejectingIOSpec(() =>
    FIO.access(() => {
      throw new Error('FAILURE')
    })
  )
  const tryNumberIO = () => {
    let i = 0

    return ForkNRun(undefined, FIO.access(() => (i += 1)))
  }

  it('should compute the computation', () => {
    let i = 0
    GetTimeline(FIO.access(() => (i = i + 1)))
    assert.strictEqual(i, 1)
  })

  it('should return the final value', () => {
    const {timeline} = tryNumberIO()
    const actual = timeline.list()
    const expected = [['RESOLVE', 1, 1]]
    assert.deepStrictEqual(actual, expected)
  })
})
