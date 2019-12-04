import {ICancellable, IScheduler} from 'ts-scheduler'

import {FiberConfig, YieldStrategyTag} from './FiberConfig'

/**
 * Base type Fiber Yield Strategy
 * Fiber can use various mechanisms to decide when to yield.
 */
export abstract class YieldStrategy {
  public static create(
    scheduler: IScheduler,
    config: FiberConfig
  ): YieldStrategy {
    switch (config.tag) {
      case YieldStrategyTag.INS_COUNT:
        return new YieldCount(scheduler, config.maxInstructionCount)
      case YieldStrategyTag.DURATION:
        return new YieldDuration(scheduler, config.maxDuration)
      default:
        return new YieldCount(scheduler)
    }
  }
  public abstract canYield(): boolean
  public abstract init(): void
  public insert<T extends unknown[]>(
    cb: (...T: T) => unknown,
    ...T: T
  ): ICancellable {
    this.init()

    return this.defer(cb, ...T)
  }
  protected abstract defer<T extends unknown[]>(
    cb: (...t: T) => unknown,
    ...t: T
  ): ICancellable
}
/**
 * The strategy signals yielding after a certain number of checks.
 */
export class YieldCount extends YieldStrategy {
  public readonly maxCount: number
  private count = 0
  public constructor(
    private readonly scheduler: IScheduler,
    maxCount: number = Number.MAX_SAFE_INTEGER
  ) {
    super()
    this.maxCount = Math.min(Math.max(1, maxCount), Number.MAX_SAFE_INTEGER)
  }
  public canYield(): boolean {
    const R = this.count > this.maxCount
    this.count++

    return R
  }
  public defer<T extends unknown[]>(
    cb: (...T: T) => unknown,
    ...T: T
  ): ICancellable {
    return this.scheduler.asap(cb, ...T)
  }
  public init(): void {
    this.count = 0
  }
}
/**
 * Yields after a quantified amount of time has passed.
 */
export class YieldDuration extends YieldStrategy {
  private start = this.scheduler.now()
  public constructor(
    private readonly scheduler: IScheduler,
    public readonly maxDuration: number
  ) {
    super()
  }
  public canYield(): boolean {
    return this.scheduler.now() - this.start >= this.maxDuration
  }
  public defer<T extends unknown[]>(
    cb: (...T: T) => unknown,
    ...T: T
  ): ICancellable {
    return this.scheduler.asap(cb, ...T)
  }
  public init(): void {
    this.start = this.scheduler.now()
  }
}
