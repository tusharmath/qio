import * as assert from 'assert'

import {FIO, UIO} from '../src/main/FIO'
import {Managed} from '../src/main/Managed'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('Managed', () => {
  const Resource = () => {
    let i = 0

    return {
      acquire: UIO(() => i++),
      release: FIO.encase(() => void i--),
      get count(): number {
        return i
      }
    }
  }

  it('should release resource on exception', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(() => FIO.reject('Failure'))
    )
    assert.strictEqual(r.count, 0)
  })

  it('should return the cause of the failure', () => {
    const r = Resource()
    const actual = testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(() =>
        FIO.reject<'Failure'>('Failure')
      )
    )
    assert.strictEqual(actual, 'Failure')
  })

  it('should release resource on completion', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(() => FIO.void())
    )
    assert.strictEqual(r.count, 0)
  })

  it('should acquire the resource', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, FIO.void).use(FIO.void)
    )

    assert.strictEqual(r.count, 1)
  })

  it('should release resource on cancellation', () => {
    const r = Resource()
    const runtime = testRuntime()

    runtime.unsafeExecute(
      Managed.make(r.acquire, r.release)
        .use(() => FIO.timeout(0, 1000))
        .fork.chain(F => F.resumeAsync(FIO.void).and(F.abort.delay(500)))
    )

    runtime.scheduler.runTo(550)
    assert.strictEqual(r.count, 0)
  })
})
