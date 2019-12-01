import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler'

import {YieldCount} from '../lib/internals/YieldStrategy'

describe('YieldASAP', () => {
  context('instruction count is Infinite', () => {
    it('should set it to MAX_SAFE_INTEGER', () => {
      assert.strictEqual(
        new YieldCount(testScheduler()).maxCount,
        Number.MAX_SAFE_INTEGER
      )
    })
  })
  context('instruction count is negative', () => {
    it('should set it to 1', () => {
      assert.strictEqual(new YieldCount(testScheduler(), -100).maxCount, 1)
    })
  })
  context('instruction count is zero', () => {
    it('should set it to 1', () => {
      assert.strictEqual(new YieldCount(testScheduler(), 0).maxCount, 1)
    })
  })
})
