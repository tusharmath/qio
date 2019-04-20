/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'

import {IO} from '../'
import {defaultEnv} from '../src/envs/SchedulerEnv'
import {Once} from '../src/operators/Once'

import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('OnceCache', () => {
  const dC = IOCollector(defaultEnv)
  ResolvingIOSpec(() => new Once(IO.of(10)))
  RejectingIOSpec(() => new Once(IO.reject(new Error('FAILED'))))

  const createNeverEndingOnceIO = () => {
    let count = 0
    const io = new Once(
      IO.from<number>((env, rej, res, sh) => sh.asap(() => res((count += 1))))
    )

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }
  const createResolvingOnceIO = (n: number) => {
    let count = 0
    const io = new Once(
      IO.from<number>((env, rej, res, sh) =>
        sh.delay(() => res((count += 1)), n)
      )
    )

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }
  const createRejectingOnceIO = (n: number) => {
    let count = 0
    const io = new Once(
      IO.from<never>((env, rej, res, sh) =>
        sh.delay(() => rej(new Error('FAILED_' + (count += 1).toString())), n)
      )
    )

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }

  it('should compute only once', () => {
    const {io, isComputedOnce} = createNeverEndingOnceIO()
    const {fork, scheduler} = dC(io)

    fork()
    fork()
    scheduler.run()

    assert.ok(isComputedOnce())
  })

  it('should be resolved for each fork', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    fork()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1], ['RESOLVE', 101, 1])

    assert.deepEqual(actual, expected)
  })

  it('should be rejected for each fork', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    fork()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(
      ['REJECT', 101, 'Error: FAILED_1'],
      ['REJECT', 101, 'Error: FAILED_1']
    )

    assert.deepEqual(actual, expected)
  })

  it('should not reject cancelled forks', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    fork()()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 101, 'Error: FAILED_1'])

    assert.deepEqual(actual, expected)
  })

  it('should not resolve completed io', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    scheduler.runTo(300)
    fork()()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1])

    assert.deepEqual(actual, expected)
  })

  it('should not reject completed io', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    scheduler.runTo(300)

    fork()()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 101, 'Error: FAILED_1'])

    assert.deepEqual(actual, expected)
  })

  it('should resolve forks after completion', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    scheduler.runTo(300)

    fork()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1], ['RESOLVE', 301, 1])

    assert.deepEqual(actual, expected)
  })

  it('should reject forks after completion', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, scheduler, timeline} = dC(io)

    fork()
    scheduler.runTo(300)

    fork()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(
      ['REJECT', 101, 'Error: FAILED_1'],
      ['REJECT', 301, 'Error: FAILED_1']
    )
    assert.deepEqual(actual, expected)
  })

  it.skip('should be referentially transparent')
})
