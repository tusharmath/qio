/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'

import {IO} from '../'
import {defaultEnv} from '../src/envs/SchedulerEnv'

import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('catch', () => {
  ResolvingIOSpec(() =>
    IO.from((sh, env, rej, res) => rej(new Error('FAILED'))).catch(e =>
      IO.of(e.message)
    )
  )
  RejectingIOSpec(() =>
    IO.from((sh, env, rej, res) => rej(new Error('FAILED'))).catch(e =>
      IO.reject(e)
    )
  )

  it('should be catchable', async () => {
    const error = new Error('Bup!')
    const actual = await IO.encase<string, []>(() => {
      throw error
    })()
      .catch((err: Error) => IO.of('ERR:' + err.message))
      .toPromise(defaultEnv)
    const expected = 'ERR:' + error.message
    assert.strictEqual(actual, expected)
  })
  it('should be forward results', async () => {
    const actual = await IO.of('ok!')
      .catch(err => IO.of('ERR:' + err.message))
      .toPromise(defaultEnv)
    const expected = 'ok!'
    assert.strictEqual(actual, expected)
  })
})
