import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {FiberContext} from '../src/internals/FiberContext'
import {FIO} from '../src/main/FIO'

describe('FiberContext', () => {
  context('when IO is forked', () => {
    it.skip('should return the same context', () => {
      let result: unknown
      const S = testScheduler()
      const context = FiberContext.of(S, FIO.of(10).fork)
      context.unsafeExecute(err => assert.fail(err), C => (result = C))
      S.run()
      assert.strictEqual(result, context)
    })
  })
})
