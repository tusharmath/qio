import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from '../internals/CB'

export enum Tag {
  Async,
  Catch,
  Chain,
  Constant,
  Map,
  Never,
  Provide,
  Reject,
  Suspend,
  Try,
  TryM
}

/**
 * Callback function used by async instruction
 */
type AsyncCB<R = unknown, E = unknown, A = unknown> = (
  env: R,
  rej: CB<E>,
  res: CB<A>,
  sh: IScheduler
) => ICancellable

interface IConstant {
  i0: unknown
  tag: Tag.Constant
}
interface IReject {
  i0: unknown
  tag: Tag.Reject
}
interface ITry {
  tag: Tag.Try
  i0(a: unknown): unknown
}
interface ITryM {
  tag: Tag.TryM
  i0(a: unknown): Instruction
}
interface IMap {
  i0: Instruction
  tag: Tag.Map
  i1(a: unknown): unknown
}
interface IChain {
  i0: Instruction
  tag: Tag.Chain
  i1(a: unknown): Instruction
}
interface ICatch {
  i0: Instruction
  tag: Tag.Catch
  i1(a: unknown): Instruction
}
interface IAsync {
  i0: AsyncCB
  tag: Tag.Async
}
interface INever {
  tag: Tag.Never
}
interface IFork {
  i0: Instruction
  tag: Tag.Suspend
}
interface IProvide {
  i0: Instruction
  i1: unknown
  tag: Tag.Provide
}

export type Instruction =
  | IAsync
  | ICatch
  | IChain
  | IConstant
  | IFork
  | IMap
  | INever
  | IProvide
  | IReject
  | ITry
  | ITryM
