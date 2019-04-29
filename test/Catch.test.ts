/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'

import {IO} from '../'
import {AnyEnv} from '../src/envs/AnyEnv'

import {GetTimeline} from './internals/GetTimeline'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('catch', () => {
  ResolvingIOSpec(() =>
    IO.from<AnyEnv, Error>((env, rej) => rej(new Error('FAILED'))).catch(e =>
      IO.of(e.message)
    )
  )
  RejectingIOSpec(() =>
    IO.from<AnyEnv, Error>((env, rej) => rej(new Error('FAILED'))).catch(e =>
      IO.reject(e)
    )
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
      IO.of('ok!').catch(err => IO.of('ERR!'))
    ).getValue()

    const expected = 'ok!'
    assert.strictEqual(actual, expected)
  })
})
