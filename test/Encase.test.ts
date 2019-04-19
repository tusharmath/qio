/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'

import {IO} from '../'
import {defaultEnv} from '../src/envs/SchedulerEnv'

import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('encase', () => {
  ResolvingIOSpec(() => IO.encase(() => 10)())
  RejectingIOSpec(() =>
    IO.encase(() => {
      throw new Error('FAILED')
    })()
  )

  it('should resolve to the return value of the function supplied', async () => {
    const fetch = (...t: string[]) => t.join(',')
    const fetchF = IO.encase(fetch)
    const actual = await fetchF('a', 'b', 'c').toPromise(defaultEnv)

    const expected = 'a,b,c'
    assert.equal(actual, expected)
  })
  it('should catch errors', async () => {
    const errorF = IO.encase<string, []>(() => {
      throw new Error('My Error')
    })
    const actual = await errorF()
      .catch(() => IO.of('caught error'))
      .toPromise(defaultEnv)
    const expected = 'caught error'
    assert.equal(actual, expected)
  })
})
