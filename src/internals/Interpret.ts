/**
 * Created by tushar on 2019-05-24
 */

import {IScheduler} from 'ts-scheduler'
import {FIO} from '../main/FIO'
import {CB} from './CB'
import {Tag} from './Tag'

export type AccessM = (value: unknown) => FIO
export type Access = (value: unknown) => unknown
export type Map = [FIO, (a: unknown) => unknown]
export type Chain = [FIO, (a: unknown) => FIO]
export type Async<E = unknown, A = unknown> = (
  rej: CB<E>,
  res: CB<A>
) => void | (() => void)

/**
 * Interprets the value of the [[FIO]]
 * @ignore
 */
export const interpret = <R, E, A>(
  io: FIO<R, E, A>,
  stack: FIO[],
  env: R,
  rej: CB<E>,
  res: CB<A>,
  scheduler: IScheduler
) => {
  let data: unknown
  stack.push(io)
  while (stack.length > 0) {
    const j = stack.pop() as FIO
    if (Tag.Constant === j.tag) {
      const i = j.props
      data = i
    } else if (Tag.Reject === j.tag) {
      const i = j.props

      return rej(i as E)
    } else if (Tag.AccessM === j.tag) {
      const i = j.props as AccessM
      stack.push(i(data))
    } else if (Tag.Access === j.tag) {
      const i = j.props as Access
      data = i(data)
    } else if (Tag.Map === j.tag) {
      const i = j.props as Map
      stack.push(FIO.access(i[1]))
      stack.push(i[0])
    } else if (Tag.Chain === j.tag) {
      const i = j.props as Chain
      stack.push(FIO.accessM(i[1]))
      stack.push(i[0])
    } else if (Tag.Async === j.tag) {
      const i = j.props as Async<E, A>

      i(
        err =>
          scheduler.asap(
            interpret,
            FIO.reject(err),
            stack,
            env,
            rej,
            res,
            scheduler
          ),
        val =>
          scheduler.asap(
            interpret,
            FIO.of(val),
            stack,
            env,
            rej,
            res,
            scheduler
          )
      )

      return
    }
  }
  res(data as A)
}
