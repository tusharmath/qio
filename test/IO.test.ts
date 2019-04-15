/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'

import {IO} from '../src/IO'

import {Counter} from './internals/Counter'
import {IOCollector} from './internals/IOCollector'
import {$} from './internals/ProxyFunction'

describe('IO', () => {
  describe('once()', () => {
    context('typings', () => {
      it('should return a an IO< IO< A > >', () => {
        $((_: IO<number>): IO<IO<number>> => _.once())
      })
    })
    it('should not throw to exit on calling once', () => {
      assert.doesNotThrow(() => IO.of(10).once())
    })
    it('should return an IO that is memoized', () => {
      const counter = Counter()
      const ioP = IOCollector(counter.inc.once())
      ioP.fork()
      ioP.scheduler.run()

      const ioC = IOCollector(ioP.timeline.getValue())
      ioC.fork()
      ioC.fork()
      ioC.scheduler.run()

      const actual = counter.getCount()
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })
})
