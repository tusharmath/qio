import {scheduler} from 'ts-scheduler'

import {Runtime} from './Runtime'

/**
 * Default runtime needed to execute any FIO.
 * Actual implementation is available at [[defaultRuntime]].
 */
export class DefaultRuntime extends Runtime {
  public readonly scheduler = scheduler
}

/**
 * Helper utility that returns the [[DefaultRuntime]].
 * Internally it contains a `scheduler` which defaults to [ts-scheduler]
 * [ts-scheduler]: https://github.com/tusharmath/ts-scheduler
 *
 * ```ts
 * import {defaultRuntime, FIO} from 'fearless-io'
 *
 * const putStrLn = FIO.encase((msg: string) => console.log(msg))
 * const greet = putStrLn('Hello World!')
 *
 * const runtime = defaultRuntime()
 *
 * runtime.execute(greet)
 * ```
 */
export const defaultRuntime = () => new DefaultRuntime()
