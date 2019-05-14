/**
 * Created by tushar on 2019-03-31
 */
import {assert} from 'chai'

import {NoEnv} from '../../src/envs/NoEnv'
import {FIO} from '../../src/main/FIO'
import {testRuntime} from '../../src/runtimes/TestRuntime'

import {IOCollector} from './IOCollector'
import {NeverEnding} from './NeverEnding'

/**
 * Specifications for an IO that resolves
 */
export const ResolvingIOSpec = <T>(fn: () => FIO<NoEnv, Error, T>) => {
  context('ResolvingIOSpec', () => {
    it('should resolve in the end', () => {
      const runtime = testRuntime()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (status.rejected = true),
        () => (status.resolved = true),
        runtime
      )
      runtime.scheduler.run()
      assert.ok(status.resolved)
    })
    it('should not reject in the end', () => {
      const runtime = testRuntime()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (status.rejected = true),
        () => (status.resolved = true),
        runtime
      )
      runtime.scheduler.run()
      assert.notOk(status.rejected)
    })
    it('should have resolving time gt fork time', () => {
      const runtime = testRuntime()
      let completionTime = -1
      fn().fork(
        {},
        () => {
          throw new Error('Should not reject')
        },
        () => (completionTime = runtime.scheduler.now()),
        runtime
      )
      const forkTime = runtime.scheduler.now()
      runtime.scheduler.run()
      assert.ok(
        completionTime > forkTime,
        `fork@${forkTime} !> completion@${completionTime}`
      )
    })
    it('should capture exceptions thrown by onResolve', () => {
      const runtime = testRuntime()
      const ERROR_MESSAGE = 'SYNC_ERROR'
      let rejectionError = ''
      fn().fork(
        {},
        err => (rejectionError = err.message),
        () => {
          throw new Error(ERROR_MESSAGE)
        },
        runtime
      )
      runtime.scheduler.run()
      assert.strictEqual(rejectionError, ERROR_MESSAGE)
    })
    it('should not resolve on current tick', () => {
      const runtime = testRuntime()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (actual.rejected = true),
        () => (actual.resolved = true),
        runtime
      )
      assert.notOk(actual.resolved)
    })
    it('should never reject once cancelled', () => {
      const runtime = testRuntime()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (actual.resolved = true),
        () => (actual.resolved = true),
        runtime
      )()
      runtime.scheduler.run()
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
export const RejectingIOSpec = <T, E>(fn: () => FIO<NoEnv, E, T>) => {
  context('RejectingIOSpec', () => {
    it('should reject in the end', () => {
      const runtime = testRuntime()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (status.rejected = true),
        () => (status.resolved = true),
        runtime
      )
      runtime.scheduler.run()
      assert.ok(status.rejected)
    })
    it('should not resolve in the end', () => {
      const runtime = testRuntime()
      const status = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (status.rejected = true),
        () => (status.resolved = true),
        runtime
      )
      runtime.scheduler.run()
      assert.notOk(status.resolved)
    })
    it('should have rejection time gt fork time', () => {
      const runtime = testRuntime()
      let completionTime = -1
      fn().fork(
        {},
        () => (completionTime = runtime.scheduler.now()),
        () => {
          throw new Error('Should not resolve')
        },
        runtime
      )
      const forkTime = runtime.scheduler.now()
      runtime.scheduler.run()
      assert.ok(
        completionTime > forkTime,
        `fork@${forkTime} !> completion@${completionTime}`
      )
    })
    it('should not reject on current tick', () => {
      const runtime = testRuntime()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (actual.rejected = true),
        () => (actual.resolved = true),
        runtime
      )
      assert.notOk(actual.rejected)
    })
    it('should never reject once cancelled', () => {
      const runtime = testRuntime()
      const actual = {
        rejected: false,
        resolved: false
      }
      fn().fork(
        {},
        () => (actual.resolved = true),
        () => (actual.resolved = true),
        runtime
      )()
      runtime.scheduler.run()
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
export const CancellationIOSpec = <E, T>(
  fn: (cancellable: FIO<NoEnv, never, never>) => FIO<NoEnv, E, T>
) => {
  context('CancellationSpec', () => {
    it('should release resources', () => {
      const neva = NeverEnding()
      const {fork, runtime} = IOCollector({}, fn(neva.io))
      const cancel = fork()
      runtime.scheduler.run()
      cancel()
      assert.ok(neva.isCancelled())
    })
  })
}

export const StackSafetySpec = <A>(
  seed: FIO<unknown, never, A>,
  fn: (io: FIO<unknown, never, A>) => FIO<unknown, never, A>
) => {
  context('StackSafetySpec', () => {
    it('should be stack safe', () => {
      let io = fn(seed)
      for (let i = 0; i < 1e5; i = i + 1) {
        io = fn(io)
      }
      const {fork, runtime} = IOCollector({}, io, {bailout: 2000})
      fork()

      runtime.scheduler.run()
    })
  })
}
