/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {IO} from '../'

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

  it('should be catchable', async () => {
    const error = new Error('Bup!')
    const actual = await IO.encase<string, []>(() => {
      throw error
    })()
      .catch((err: Error) => IO.of('ERR:' + err.message))
      .toPromise({scheduler: testScheduler()})
    const expected = 'ERR:' + error.message
    assert.strictEqual(actual, expected)
  })
  it('should be forward results', async () => {
    const actual = await IO.of('ok!')
      .catch(err => IO.of('ERR:' + err.message))
      .toPromise({scheduler: testScheduler()})
    const expected = 'ok!'
    assert.strictEqual(actual, expected)
  })
})
