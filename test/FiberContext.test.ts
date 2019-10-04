import {assert} from 'chai'

import {FiberContext} from '../src/internals/FiberContext'
import {FIO} from '../src/main/FIO'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('FiberContext', () => {
  context('when IO is forked', () => {
    it('should return the same context', () => {
      let result: unknown
      const runtime = testRuntime()
      const context = FiberContext.of(runtime, FIO.of(10).fork)
      context.unsafeExecute(err => assert.fail(err), C => (result = C))
      runtime.scheduler.run()
      assert.strictEqual(result, context)
    })
  })
})
