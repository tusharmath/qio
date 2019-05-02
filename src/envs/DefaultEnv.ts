import {IScheduler, scheduler} from 'ts-scheduler'

/**
 * Default env needed to create any FIO.
 * Not specific to browser or Node.js.
 * Actual implementation is available at [[defaultEnv]].
 */
export interface DefaultEnv {
  scheduler: IScheduler
}

/**
 * Helper utility that returns the default env
 *
 * @example
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
 * greet.fork(defaultEnv, onRej, onRes)
 * ```
 */
export const defaultEnv: DefaultEnv = {scheduler}
