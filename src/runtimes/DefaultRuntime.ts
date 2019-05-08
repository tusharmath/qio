import {Cancel, scheduler} from 'ts-scheduler'

import {NoEnv} from '../envs/NoEnv'
import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {noop} from '../internals/Noop'
import {onError} from '../internals/OnError'

import {Runtime} from './Runtime'

/**
 * Default runtime needed to execute any FIO.
 * A new instance can be created by calling [[defaultRuntime]].
 */
export class DefaultRuntime implements Runtime {
  public readonly scheduler = scheduler

  public execute<E, A>(
    io: IFIO<NoEnv, E, A>,
    res: CB<A> = noop,
    rej: CB<E> = onError
  ): Cancel {
    return io.fork(undefined, rej, res, this)
  }
}

/**
 * Helper utility that returns an instance of [[DefaultRuntime]].
 * Internally it contains a `scheduler` which defaults to [ts-scheduler](https://github.com/tusharmath/ts-scheduler)
 *
 * ```ts
 * import {defaultRuntime, FIO} from 'fearless-io'
 *
 * // Create a FIO
 * const greet = FIO.encase(() => console.log('Hello World!'))
 *
 * // Create a Runtime
 * const runtime = defaultRuntime()
 *
 * // Execute the effect
 * runtime.execute(greet)
 * ```
 */
export const defaultRuntime = () => new DefaultRuntime()
