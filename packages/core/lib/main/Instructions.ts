import {ICancellable} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FiberRuntime} from '../runtimes/FiberRuntime'

/**
 * @ignore
 */
export enum Tag {
  Access,
  Async,
  Call,
  Capture,
  Catch,
  Chain,
  Constant,
  Fork,
  Map,
  Never,
  Provide,
  Reject,
  Runtime,
  Try,
  TryM,
}

export interface ICall<T extends unknown[] = unknown[]> {
  i1: T
  tag: Tag.Call
  i0(...t: T): Instruction
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
export interface IAsync<A = unknown, E = unknown> {
  tag: Tag.Async

  i0(res: CB<A>, rej: CB<E>): ICancellable
}
export interface INever {
  tag: Tag.Never
}
export interface IFork {
  i0: Instruction
  i1: FiberRuntime
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

export interface ICapture<A = unknown> {
  tag: Tag.Capture
  i0(i: A): Instruction
}

export interface IRTime {
  tag: Tag.Runtime
}

/**
 * @ignore
 */
export type Instruction =
  | IAccess
  | IAsync
  | ICall
  | ICapture
  | ICatch
  | IChain
  | IConstant
  | IFork
  | IMap
  | INever
  | IProvide
  | IReject
  | IRTime
  | ITry
  | ITryM
