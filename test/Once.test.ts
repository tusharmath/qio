/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'

import {FIO} from '../'
import {Once} from '../src/operators/Once'

import {IOCollector} from './internals/IOCollector'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('Once', () => {
  ResolvingIOSpec(() => new Once(FIO.of(10)))
  RejectingIOSpec(() => new Once(FIO.reject(new Error('FAILED'))))
  CancellationIOSpec(cancellable => new Once(cancellable))

  const createNeverEndingOnceIO = () => {
    let count = 0
    const io = new Once(FIO.try(() => (count += 1)))

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }
  const createResolvingOnceIO = (n: number) => {
    let count = 0
    const io = new Once(FIO.try(() => (count += 1)).delay(n))

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }
  const createRejectingOnceIO = (n: number) => {
    let count = 0
    const io = new Once(
      FIO.try(() => (count += 1))
        .chain(cnt => FIO.reject(new Error('FAILED_' + cnt)))
        .delay(n)
    )

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }

  it('should compute only once', () => {
    const {io, isComputedOnce} = createNeverEndingOnceIO()
    const {fork, runtime} = IOCollector(undefined, io)

    fork()
    fork()
    runtime.scheduler.run()

    assert.ok(isComputedOnce())
  })

  it('should be resolved for each fork', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    fork()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1], ['RESOLVE', 101, 1])

    assert.deepEqual(actual, expected)
  })

  it('should be rejected for each fork', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    fork()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(
      ['REJECT', 101, 'Error: FAILED_1'],
      ['REJECT', 101, 'Error: FAILED_1']
    )

    assert.deepEqual(actual, expected)
  })

  it('should not reject cancelled forks', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    fork().cancel()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 101, 'Error: FAILED_1'])

    assert.deepEqual(actual, expected)
  })

  it('should not resolve completed io', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    runtime.scheduler.runTo(300)
    fork().cancel()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1])

    assert.deepEqual(actual, expected)
  })

  it('should not reject completed io', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    runtime.scheduler.runTo(300)

    fork().cancel()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 101, 'Error: FAILED_1'])

    assert.deepEqual(actual, expected)
  })

  it('should resolve forks after completion', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    runtime.scheduler.runTo(300)

    fork()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1], ['RESOLVE', 301, 1])

    assert.deepEqual(actual, expected)
  })

  it('should reject forks after completion', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, timeline, runtime} = IOCollector(undefined, io)

    fork()
    runtime.scheduler.runTo(300)

    fork()
    runtime.scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(
      ['REJECT', 101, 'Error: FAILED_1'],
      ['REJECT', 301, 'Error: FAILED_1']
    )
    assert.deepEqual(actual, expected)
  })
})
