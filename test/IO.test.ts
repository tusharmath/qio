/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'

import {defaultEnv, DefaultEnv} from '../src/internals/DefaultEnv'
import {IO} from '../src/IO'

import {Counter} from './internals/Counter'
import {ForkNRun} from './internals/ForkNRun'
import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'
import {$} from './internals/ProxyFunction'

const fR = ForkNRun(defaultEnv)
const dC = IOCollector(defaultEnv)

describe('IO', () => {
  describe('once()', () => {
    context('typings', () => {
      it('should return a an IO< IO< A > >', () => {
        interface TestENV {
          name: IO<DefaultEnv, string>
        }
        $(
          (_: IO<TestENV, number>): IO<DefaultEnv, IO<TestENV, number>> =>
            _.once()
        )
      })
    })
    it('should not throw to exit on calling once', () => {
      assert.doesNotThrow(() => IO.of(10).once())
    })
    it('should return an IO that is memoized', () => {
      const counter = Counter()
      const ioP = fR(counter.inc.once())
      const ioC = dC(ioP.timeline.getValue())
      ioC.fork()
      ioC.fork()
      ioC.scheduler.run()

      const actual = counter.getCount()
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })
  describe('provide()', () => {
    ResolvingIOSpec(() => IO.of(10).provide({}))
    RejectingIOSpec(() => IO.reject(new Error('FAILED')).provide({}))

    it('should pass on the env', () => assert.fail('not implemented'))
  })
  describe('access()', () => {
    // ResolvingIOSpec(() => IO.access(10).provide({}))
    // RejectingIOSpec(() => IO.reject(new Error('FAILED')).provide({}))
  })
})
