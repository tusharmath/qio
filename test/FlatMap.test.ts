/**
 * Created by tushar on 2019-03-11
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {IO} from '../'
import {defaultEnv} from '../src/envs/SchedulerEnv'

import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('flatMap', () => {
  it('should flatten the value', async () => {
    const actual = await IO.of(10)
      .chain((i: number) => IO.of(i + 1))
      .toPromise({scheduler: testScheduler()})
    const expected = 11
    assert.equal(actual, expected)
  })
  ResolvingIOSpec(() => IO.of(10).chain(i => IO.of(100)))
  RejectingIOSpec(() => IO.of(10).chain(i => IO.reject(new Error('FAILED'))))
})
