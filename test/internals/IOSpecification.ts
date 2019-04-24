/**
 * Created by tushar on 2019-03-31
 */
import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {AnyEnv} from '../../src/envs/AnyEnv'
import {SchedulerEnv} from '../../src/envs/SchedulerEnv'
import {FIO} from '../../src/internals/FIO'
import {IO} from '../../src/main/IO'

import {IOCollector} from './IOCollector'
import {NeverEnding} from './NeverEnding'

/**
 * Specifications for an IO that resolves
 */
export const ResolvingIOSpec = <T>(fn: () => FIO<SchedulerEnv, T>) => {
  context('ResolvingIOSpec', () => {
    it('should resolve in the end', () => {
      const S = testScheduler()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (status.rejected = true),
        () => (status.resolved = true)
      )
      S.run()
      assert.ok(status.resolved)
    })
    it('should not reject in the end', () => {
      const S = testScheduler()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (status.rejected = true),
        () => (status.resolved = true)
      )
      S.run()
      assert.notOk(status.rejected)
    })
    it('should have resolving time gt fork time', () => {
      const S = testScheduler()
      let completionTime = -1
      fn().fork(
        {scheduler: S},
        () => {
          throw new Error('Should not reject')
        },
        () => (completionTime = S.now())
      )
      const forkTime = S.now()
      S.run()
      assert.ok(
        completionTime > forkTime,
        `fork@${forkTime} !> completion@${completionTime}`
      )
    })
    it('should capture exceptions thrown by onResolve', () => {
      const S = testScheduler()
      const ERROR_MESSAGE = 'SYNC_ERROR'
      let rejectionError = ''
      fn().fork(
        {scheduler: S},
        err => (rejectionError = err.message),
        () => {
          throw new Error(ERROR_MESSAGE)
        }
      )
      S.run()
      assert.strictEqual(rejectionError, ERROR_MESSAGE)
    })
    it('should not resolve on current tick', () => {
      const S = testScheduler()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (actual.rejected = true),
        () => (actual.resolved = true)
      )
      assert.notOk(actual.resolved)
    })
    it('should never reject once cancelled', () => {
      const S = testScheduler()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (actual.resolved = true),
        () => (actual.resolved = true)
      )()
      S.run()
      const expected = {
        rejected: false,
        resolved: false
      }
      assert.deepEqual(actual, expected)
    })
  })
}

/**
 * Specifications for an IO that rejects
 */
export const RejectingIOSpec = <T>(fn: () => FIO<SchedulerEnv, T>) => {
  context('RejectingIOSpec', () => {
    it('should reject in the end', () => {
      const S = testScheduler()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (status.rejected = true),
        () => (status.resolved = true)
      )
      S.run()
      assert.ok(status.rejected)
    })
    it('should not resolve in the end', () => {
      const S = testScheduler()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (status.rejected = true),
        () => (status.resolved = true)
      )
      S.run()
      assert.notOk(status.resolved)
    })
    it('should have rejection time gt fork time', () => {
      const S = testScheduler()
      let completionTime = -1
      fn().fork(
        {scheduler: S},
        () => (completionTime = S.now()),
        () => {
          throw new Error('Should not resolve')
        }
      )
      const forkTime = S.now()
      S.run()
      assert.ok(
        completionTime > forkTime,
        `fork@${forkTime} !> completion@${completionTime}`
      )
    })
    it('should not reject on current tick', () => {
      const S = testScheduler()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (actual.rejected = true),
        () => (actual.resolved = true)
      )
      assert.notOk(actual.rejected)
    })
    it('should never reject once cancelled', () => {
      const S = testScheduler()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {scheduler: S},
        () => (actual.resolved = true),
        () => (actual.resolved = true)
      )()
      S.run()
      const expected = {
        rejected: false,
        resolved: false
      }
      assert.deepEqual(actual, expected)
    })
  })
}

/**
 * Checks if the IO gets cancelled or not
 */
export const CancellationIOSpec = <T>(
  fn: (cancellable: IO<AnyEnv, never>) => FIO<SchedulerEnv, T>
) => {
  it('should release resources', () => {
    const neva = NeverEnding()
    const scheduler = testScheduler()
    const {fork} = IOCollector({scheduler}, fn(neva.io))
    const cancel = fork()
    scheduler.run()
    cancel()
    assert.ok(neva.isCancelled())
  })
}
