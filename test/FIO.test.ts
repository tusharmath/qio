/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {NoEnv} from '../src/envs/NoEnv'
import {FIO} from '../src/main/FIO'
import {DefaultRuntime} from '../src/runtimes/DefaultRuntime'
import {TestRuntime} from '../src/runtimes/TestRuntime'

import {Counter} from './internals/Counter'
import {ForkNRun} from './internals/ForkNRun'
import {GetTimeline} from './internals/GetTimeline'
import {IOCollector} from './internals/IOCollector'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('FIO', () => {
  describe('once()', () => {
    it('should not throw to exit on calling once', () => {
      assert.doesNotThrow(() => FIO.of(10).once())
    })
    it('should return an IO that is memoized', () => {
      const counter = Counter()
      const ioP = ForkNRun(undefined, counter.inc.once())
      const ioC = IOCollector(undefined, ioP.timeline.getValue())
      ioC.fork()
      ioC.fork()
      ioC.runtime.scheduler.run()

      const actual = counter.getCount()
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })
  describe('provide()', () => {
    it('should pass on the env', () => {
      const env = {scheduler: testScheduler(), test: {a: 'a', b: 'b'}}
      const {timeline} = ForkNRun(env, FIO.of(10).provide(env))
      const actual = timeline.list()
      const expected = [['RESOLVE', 1, 10]]

      assert.deepStrictEqual(actual, expected)
    })
  })
  describe('access()', () => {
    it('should create an IO[R, A] ', () => {
      interface Console {
        print(str: string): void
      }

      interface HasConsole {
        console: Console
      }

      const Console = () => {
        const strings = new Array<string>()

        return {
          list: () => strings.slice(0),
          print: (str: string) => void strings.push(str)
        }
      }

      const putStrLn = (line: string) =>
        FIO.access((_: HasConsole) => _.console.print(line))

      const cons = Console()
      const env: HasConsole = {
        console: cons
      }
      ForkNRun(env, putStrLn('HELLO WORLD'))

      const actual = cons.list()
      const expected = ['HELLO WORLD']

      assert.deepStrictEqual(actual, expected)
    })
    ResolvingIOSpec(() => FIO.access(() => 10))
    RejectingIOSpec(() =>
      FIO.access(() => {
        throw new Error('FAILED')
      })
    )
  })
  describe('accessM()', () => {
    it('should create an IO[R, A] ', () => {
      interface Console {
        print(str: string): FIO<NoEnv, Error, void>
      }

      interface HasConsole {
        console: Console
      }

      const Console = () => {
        const strings = new Array<string>()

        return {
          list: () => strings.slice(0),
          print: FIO.encase((str: string) => void strings.push(str))
        }
      }

      const putStrLn = (line: string) =>
        FIO.accessM((_: HasConsole) => _.console.print(line))

      const cons = Console()
      const env = {console: cons, scheduler: testScheduler()}
      ForkNRun(env, putStrLn('HELLO WORLD'))

      const actual = cons.list()
      const expected = ['HELLO WORLD']

      assert.deepStrictEqual(actual, expected)
    })
    ResolvingIOSpec(() => FIO.accessM(() => FIO.of(10)))
    RejectingIOSpec(() =>
      FIO.accessM(() => {
        throw new Error('FAILED')
      })
    )
    RejectingIOSpec(() => FIO.accessM(() => FIO.reject(new Error('FAILED'))))
  })
  describe('environment()', () => {
    it('should return the env its being forked with', () => {
      interface Console {
        console: {print(str: string): void}
      }
      const io = FIO.environment<Console>()
      const out = new Array<string>()
      const ConsoleService = {
        print: (str: string): void => {
          out.push(str)
        }
      }
      const env: Console = {
        console: ConsoleService
      }
      const {timeline} = ForkNRun(env, io)

      const actual = timeline.getValue().console
      const expected = ConsoleService

      assert.strictEqual(actual, expected)
    })

    ResolvingIOSpec(() => FIO.environment())
  })
  describe('delay()', () => {
    ResolvingIOSpec(() => FIO.of(1).delay(10))
    RejectingIOSpec(() => FIO.reject(new Error('Bup!')).delay(10))
    CancellationIOSpec(cancel => cancel.delay(10))
    it('should delay the execution by the given duration', () => {
      const io = FIO.from<NoEnv, never, number>((env1, rej, res, runtime) => {
        res(runtime.scheduler.now())
      }).delay(100)

      const actual = GetTimeline(io).getValue()
      const expected = 100

      assert.strictEqual(actual, expected)
    })
  })
})
