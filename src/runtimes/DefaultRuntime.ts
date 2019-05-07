import {IScheduler, scheduler} from 'ts-scheduler'

/**
 * Default runtime needed to execute any FIO.
 * Actual implementation is available at [[defaultRuntime]].
 */
export interface DefaultRuntime {
  scheduler: IScheduler
}

/**
 * Helper utility that returns the default env.
 * Internally it contains a `scheduler` which defaults to [ts-scheduler]
 * [ts-scheduler]: https://github.com/tusharmath/ts-scheduler
 *
 * ```ts
 * import {defaultEnv, FIO} from 'fearless-io'
 *
 * const putStrLn = FIO.encase((msg: string) => console.log(msg))
 * const greet = putStrLn('Hello World!')
 *
 * // Executing IO
 * const onRej = () => {
 *   console.log('Failure')
 *   process.exit(1)
 * }
 * const onRes = () => {
 *   process.exit(0)
 * }
 *
 * // Pass `defaultEnv` as the first argument
 * greet.fork(defaultEnv(), onRej, onRes)
 * ```
 */
export const defaultRuntime = (): DefaultRuntime => ({scheduler})
