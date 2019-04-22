/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {IO} from '../'

import {ForkNRun} from './internals/ForkNRun'
import {GetTimeline} from './internals/GetTimeline'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('catch', () => {
  ResolvingIOSpec(() =>
    IO.from((env, rej) => rej(new Error('FAILED'))).catch(e => IO.of(e.message))
  )
  RejectingIOSpec(() =>
    IO.from((env, rej) => rej(new Error('FAILED'))).catch(e => IO.reject(e))
  )
  CancellationIOSpec(io => IO.reject(new Error('!!!')).catch(() => io))
  CancellationIOSpec(io => io.catch(() => IO.of('Caught')))

  it('should be catchable', () => {
    const error = new Error('Bup!')
    const actual = GetTimeline(
      IO.reject(error).catch(e => IO.of(e.message))
    ).getValue()

    const expected = 'Bup!'
    assert.strictEqual(actual, expected)
  })
  it('should forward results', () => {
    const actual = GetTimeline(
      IO.of('ok!').catch(err => IO.of('ERR:' + err.message))
    ).getValue()

    const expected = 'ok!'
    assert.strictEqual(actual, expected)
  })
})
