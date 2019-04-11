/**
 * Created by tushar on 2019-03-31
 */
import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {XIO} from '../../src/internals/XIO'
import {Chain} from '../../src/operators/Chain'
import {Computation} from '../../src/sources/Computation'

/**
 * Specifications for an IO that resolves
 */
export const ResolvingIOSpec = <T>(fn: () => XIO<T>) => {
  context('ResolvingIOSpec', () => {
    it('should resolve in the end', () => {
      const S = testScheduler()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        S,
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
        S,
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
        S,
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
        S,
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
        S,
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
        S,
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
    it('should cancel chained IO', () => {
      const S = testScheduler()
      let isCancelled = false
      const io = new Chain(
        fn(),
        () => new Computation<never>(() => () => (isCancelled = true))
      )
      const cancel = io.fork(
        S,
        () => {
          assert.fail('IO should not reject')
        },
        () => {
          assert.fail('IO should not resolve')
        }
      )
      S.run()
      cancel()
      assert.ok(isCancelled)
    })
  })
}

/**
 * Specifications for an IO that rejects
 */
export const createRejectingIOSpec = <T>(fn: () => XIO<T>) => {
  context('RejectingIOSpec', () => {
    it('should reject in the end', () => {
      const S = testScheduler()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        S,
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
        S,
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
        S,
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
        S,
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
        S,
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
