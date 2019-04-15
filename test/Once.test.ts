/**
 * Created by tushar on 2019-03-23
 */
import {assert} from 'chai'

import {IO} from '../'

import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('Once', () => {
  ResolvingIOSpec(() => IO.from((rej, res) => res(10)).once())
  RejectingIOSpec(() => IO.from(rej => rej(new Error('FAILED'))).once())
  const createNeverEndingOnceIO = () => {
    let count = 0
    const io = IO.from((rej, res, sh) =>
      sh.asap(() => res((count += 1)))
    ).once()

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }

  const createResolvingOnceIO = (n: number) => {
    let count = 0
    const io = IO.from((rej, res, sh) =>
      sh.delay(() => res((count += 1)), n)
    ).once()

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }

  const createRejectingOnceIO = (n: number) => {
    let count = 0
    const io = IO.from((rej, res, sh) =>
      sh.delay(() => rej(new Error('FAILED_' + (count += 1).toString())), n)
    ).once()

    return {
      io,
      isComputedOnce: () => count === 1
    }
  }

  it('should compute only once', () => {
    const {io, isComputedOnce} = createNeverEndingOnceIO()
    const {fork, scheduler} = IOCollector(io)

    fork()
    fork()
    scheduler.run()

    assert.ok(isComputedOnce())
  })

  it('should be resolved for each fork', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, scheduler, timeline} = IOCollector(io)

    fork()
    fork()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['RESOLVE', 101, 1], ['RESOLVE', 101, 1])

    assert.deepEqual(actual, expected)
  })

  it('should be rejected for each fork', () => {
    const {io} = createRejectingOnceIO(100)
    const {fork, scheduler, timeline} = IOCollector(io)

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
    const {fork, scheduler, timeline} = IOCollector(io)

    fork()
    fork()()
    scheduler.run()

    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 101, 'Error: FAILED_1'])

    assert.deepEqual(actual, expected)
  })

  it('should not resolve completed io', () => {
    const {io} = createResolvingOnceIO(100)
    const {fork, scheduler, timeline} = IOCollector(io)

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
    const {fork, scheduler, timeline} = IOCollector(io)

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
    const {fork, scheduler, timeline} = IOCollector(io)

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
    const {fork, scheduler, timeline} = IOCollector(io)

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

  it('should be referentially transparent', () => {
    const counterIO = () => {
      let count = 0

      return IO.try(() => (count += 1))
    }

    const ioA = counterIO().once()

    const ioB = counterIO()

    const collectorA = IOCollector(ioA.chain(() => ioA))
    const collectorB = IOCollector(ioB.once().chain(() => ioB.once()))

    collectorA.fork()
    collectorB.fork()
    collectorA.fork()
    collectorB.fork()

    collectorA.scheduler.run()
    collectorB.scheduler.run()

    assert.deepEqual(collectorA.timeline.list(), [
      ['RESOLVE', 1, 1],
      ['RESOLVE', 1, 1]
    ])
    assert.deepEqual(collectorA.timeline.list(), collectorB.timeline.list())
  })
})
