import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from './CB'

export enum Tag {
  Constant = 0,
  Resume = 3,
  ResumeM = 4,
  Map = 5,
  Chain = 6,
  Async = 7,
  Reject = 8,
  Never = 9,
  Catch = 10
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
  tag: Tag.Constant
  i0: unknown
}
interface IReject {
  tag: Tag.Reject
  i0: unknown
}
interface IResume {
  tag: Tag.Resume
  i0(a: unknown): unknown
}
interface IResumeM {
  tag: Tag.ResumeM
  i0(a: unknown): Fiber
}
interface IMap {
  tag: Tag.Map
  i0: Fiber
  i1(a: unknown): unknown
}
interface IChain {
  tag: Tag.Chain
  i0: Fiber
  i1(a: unknown): Fiber
}
interface ICatch {
  tag: Tag.Catch
  i0: Fiber
  i1(a: unknown): Fiber
}
interface IAsync {
  tag: Tag.Async
  i0: AsyncCB
}
interface INever {
  tag: Tag.Never
}

export type Fiber =
  | ICatch
  | IChain
  | IConstant
  | IReject
  | IResume
  | IResumeM
  | IMap
  | IAsync
  | INever
