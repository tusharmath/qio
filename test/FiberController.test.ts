import {assert, spy} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {FiberController} from '../src/internals/FiberController'
import {FIO} from '../src/main/FIO'

import {Counter} from './internals/Counter'

describe('FiberController', () => {
  context('on creation', () => {
    it('should not execute', () => {
      const counter = new Counter()
      const scheduler = testScheduler()

      const controller = new FiberController(scheduler, counter.inc())

      controller.observe(spy(), spy())

      assert.strictEqual(counter.count, 0)
    })
  })

  context('on cancellation', () => {
    it('should not execute', () => {
      const counter = new Counter()
      const scheduler = testScheduler()

      const controller = new FiberController(scheduler, counter.inc())
      controller.cancel()
      scheduler.run()

      controller.observe(spy(), spy())

      assert.strictEqual(counter.count, 0)
    })
  })

  context('on observer cancellation', () => {
    it('should not call observers', () => {
      const scheduler = testScheduler()
      const rej = spy()
      const res = spy()

      new FiberController(scheduler, FIO.of(0)).observe(rej, res).cancel()
      scheduler.run()

      assert.ok(rej.should.not.be.called)
      assert.ok(res.should.not.be.called)
    })
  })

  context('on error', () => {
    it('should call rej with cause', () => {
      const scheduler = testScheduler()
      const res = spy()
      const rej = spy()

      new FiberController(scheduler, FIO.reject(1)).observe(rej, res)
      scheduler.run()

      assert.ok(rej.should.called.with(1))
    })
  })

  context('on success', () => {
    it('should call res with value', () => {
      const scheduler = testScheduler()
      const res = spy()
      const rej = spy()

      new FiberController(scheduler, FIO.of(1)).observe(rej, res)
      scheduler.run()

      assert.ok(res.should.called.with(1))
    })
  })

  context('on completed', () => {
    it('should call res with computed result', () => {
      const scheduler = testScheduler()
      const res = spy()
      const rej = spy()

      const context = new FiberController(scheduler, FIO.of(1))
      scheduler.run()
      context.observe(rej, res)
      scheduler.run()

      assert.ok(res.should.called.with(1))
    })

    it('should call rej with computed cause', () => {
      const scheduler = testScheduler()
      const res = spy()
      const rej = spy()

      const context = new FiberController(scheduler, FIO.reject(1))
      scheduler.run()
      context.observe(rej, res)
      scheduler.run()

      assert.ok(rej.should.called.with(1))
    })
  })
})
