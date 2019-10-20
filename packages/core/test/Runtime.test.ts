import {assert} from 'chai'

import {testRuntime} from '../src/runtimes/TestRuntime'

describe('runtime', () => {
  context('instruction count is Infinite', () => {
    it('should set it to MAX_SAFE_INTEGER', () => {
      const runtime = testRuntime({maxInstructionCount: Infinity})
      assert.strictEqual(runtime.maxInstructionCount, Number.MAX_SAFE_INTEGER)
    })
  })
  context('instruction count is negative', () => {
    it('should set it to 1', () => {
      const runtime = testRuntime({maxInstructionCount: -100})
      assert.strictEqual(runtime.maxInstructionCount, 1)
    })
  })
  context('instruction count is zero', () => {
    it('should set it to 1', () => {
      const runtime = testRuntime({maxInstructionCount: 0})
      assert.strictEqual(runtime.maxInstructionCount, 1)
    })
  })
})
