/* tslint:disable: prefer-function-over-method switch-default */

/**
 * Tags used to identify the scheduling strategy.
 */
export enum YieldStrategyTag {
  INS_COUNT,
  DURATION,
}

export interface IAsapM {
  maxInstructionCount?: number
  tag: YieldStrategyTag.INS_COUNT
}

export interface IDurationM {
  maxDuration: number
  tag: YieldStrategyTag.DURATION
}

export type FiberConfig = IAsapM | IDurationM

export const FiberConfig = {
  get DEFAULT(): IAsapM {
    return FiberConfig.MAX_INSTRUCTION_COUNT()
  },
  MAX_DURATION(maxDuration: number): IDurationM {
    return {tag: YieldStrategyTag.DURATION, maxDuration}
  },
  MAX_INSTRUCTION_COUNT(maxInstructionCount?: number): IAsapM {
    return {tag: YieldStrategyTag.INS_COUNT, maxInstructionCount}
  },
}
