import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from '../internals/CB'

/**
 * @ignore
 */
export enum Tag {
  Access,
  Async,
  Catch,
  Chain,
  Constant,
  Environment,
  Fork,
  Map,
  Never,
  Provide,
  Reject,
  Try,
  TryM
}

export interface IConstant<A = unknown> {
  i0: A
  tag: Tag.Constant
}
export interface IReject<A = unknown> {
  i0: A
  tag: Tag.Reject
}
export interface ITry<A = unknown, B = unknown> {
  tag: Tag.Try
  i0(a: A): B
}
export interface ITryM<A = unknown> {
  tag: Tag.TryM
  i0(A: A): Instruction
}
export interface IMap<A = unknown, B = unknown> {
  i0: Instruction
  tag: Tag.Map
  i1(a: A): B
}
export interface IChain<A = unknown> {
  i0: Instruction
  tag: Tag.Chain
  i1(a: A): Instruction
}
export interface ICatch<E = unknown> {
  i0: Instruction
  tag: Tag.Catch
  i1(E: E): Instruction
}
export interface IAsync<E = unknown, A = unknown> {
  tag: Tag.Async
  i0(rej: CB<E>, res: CB<A>, sh: IScheduler): ICancellable
}
export interface INever {
  tag: Tag.Never
}
export interface IFork {
  i0: Instruction
  tag: Tag.Fork
}
export interface IAccess<X = unknown, Y = unknown> {
  tag: Tag.Access
  i0(X: X): Y
}
export interface IProvide<R = unknown> {
  i0: Instruction
  i1: R
  tag: Tag.Provide
}

export interface IEnvironment {
  tag: Tag.Environment
}

/**
 * @ignore
 */
export type Instruction =
  | IAccess
  | IAsync
  | ICatch
  | IChain
  | IConstant
  | IEnvironment
  | IFork
  | IMap
  | INever
  | IProvide
  | IReject
  | ITry
  | ITryM
