import {IScheduler} from 'ts-scheduler'

/**
 * Default env needed to create any IO
 * Not specific to browser or Node.js
 */

export interface DefaultEnv {
  scheduler: IScheduler
}
