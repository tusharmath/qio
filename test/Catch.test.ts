/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'

import {FIO} from '../'
import {NoEnv} from '../src/envs/NoEnv'

import {GetTimeline} from './internals/GetTimeline'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('catch', () => {
  ResolvingIOSpec(() =>
    FIO.from<NoEnv, Error>((env, rej) => rej(new Error('FAILED'))).catch(e =>
      FIO.of(e.message)
    )
  )
  RejectingIOSpec(() =>
    FIO.from<NoEnv, Error>((env, rej) => rej(new Error('FAILED'))).catch(e =>
      FIO.reject(e)
    )
  )
  CancellationIOSpec(io => FIO.reject(new Error('!!!')).catch(() => io))
  CancellationIOSpec(io => io.catch(() => FIO.of('Caught')))

  it('should be catchable', () => {
    const error = new Error('Bup!')
    const actual = GetTimeline(
      FIO.reject(error).catch(e => FIO.of(e.message))
    ).getValue()

    const expected = 'Bup!'
    assert.strictEqual(actual, expected)
  })
  it('should forward results', () => {
    const actual = GetTimeline(
      FIO.of('ok!').catch(err => FIO.of('ERR!'))
    ).getValue()

    const expected = 'ok!'
    assert.strictEqual(actual, expected)
  })
})
