import {ICancellable} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FiberRuntime} from '../runtimes/FiberRuntime'
import {Exit} from './Exit'

/**
 * @ignore
 */
export enum Tag {
  Access,
  Async_DEPRECATED,
  Call_DEPRECATED,
  Capture,
  Catch,
  Chain,
  ExitCallback,
  Resolve,
  Fork,
  Map_DEPRECATED,
  Never,
  Provide,
  Reject,
  Runtime_DEPRECATED,
  Effect,
  TryM_DEPRECATED,
}

export interface ICall<T extends unknown[] = unknown[]> {
  i1: T
  tag: Tag.Call_DEPRECATED
  i0(...t: T): Instruction
}

export interface IConstant<A = unknown> {
  i0: A
  tag: Tag.Resolve
}
export interface IReject<A = unknown> {
  i0: A
  tag: Tag.Reject
}
export interface IEffect<A = unknown, B = unknown> {
  tag: Tag.Effect
  i0(a: A): B
}
export interface ITryM<A = unknown> {
  tag: Tag.TryM_DEPRECATED
  i0(A: A): Instruction
}
export interface IMap<A = unknown, B = unknown> {
  i0: Instruction
  tag: Tag.Map_DEPRECATED
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
  tag: Tag.Async_DEPRECATED
  i0(res: CB<A>, rej: CB<E>): ICancellable
}

export interface IExitCallback<A = unknown, E = unknown> {
  tag: Tag.ExitCallback
  i0(cb: (_: Exit<A, E>) => void): void
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
  tag: Tag.Runtime_DEPRECATED
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
  | IExitCallback
  | IFork
  | IMap
  | INever
  | IProvide
  | IReject
  | IRTime
  | IEffect
  | ITryM
