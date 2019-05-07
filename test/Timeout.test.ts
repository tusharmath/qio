/**
 * Created by tushar on 2019-03-22
 */
import * as assert from 'assert'
import {testScheduler} from 'ts-scheduler/test'

import {FIO} from '../'

import {IOCollector} from './internals/IOCollector'
import {ResolvingIOSpec} from './internals/IOSpecification'
import {TimeSlice} from './internals/Timeline'

describe('Timeout', () => {
  ResolvingIOSpec(() => FIO.timeout('DONE', 1000))
  it('should resolve at the provided time', () => {
    const io = FIO.timeout('Bananas', 1000)

    const {timeline, fork, runtime} = IOCollector(undefined, io)

    runtime.scheduler.runTo(100)
    fork()
    runtime.scheduler.runTo(1100)

    const actual = timeline.list()
    const expected = [['RESOLVE', 1100, 'Bananas']]

    assert.deepStrictEqual(actual, expected)
  })

  it('should be cancellable', () => {
    const io = FIO.timeout('AAA', 1000)
    const scheduler = testScheduler()
    const {timeline, fork} = IOCollector({scheduler}, io)

    scheduler.runTo(100)
    const cancel = fork()
    scheduler.runTo(500)
    cancel()

    const actual = timeline.list()
    const expected: Array<TimeSlice<string>> = []

    assert.deepStrictEqual(actual, expected)
  })
})
