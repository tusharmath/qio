/**
 * Created by tushar on 2019-05-24
 */

import {ICancellable, IScheduler} from 'ts-scheduler'

import {FIO} from '../main/FIO'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {Tag} from './Tag'

export type AccessM = (value: unknown) => FIO
export type Access = (value: unknown) => unknown
export type Resume = (value: unknown) => unknown
export type ResumeM = (value: unknown) => FIO
export type Map = [FIO, (a: unknown) => unknown]
export type Chain = [FIO, (a: unknown) => FIO]
export type Catch = [FIO, (a: unknown) => FIO]
export type Async<R = unknown, E = unknown, A = unknown> = (
  env: R,
  rej: CB<E>,
  res: CB<A>,
  sh: IScheduler
) => ICancellable

/**
 * Fiber is internal to the library.
 * Because its a function only, it has minimum property accesses which improves runtime performance.
 */
export const Fiber = <R, E, A>(
  io: FIO<R, E, A>,
  env: R,
  rej: CB<E>,
  res: CB<A>,
  stackA: FIO[],
  stackE: Array<(e: unknown) => FIO>,
  cancellationList: CancellationList,
  sh: IScheduler
) => {
  let data: unknown
  stackA.push(io)
  while (stackA.length > 0) {
    const j = stackA.pop() as FIO

    // Constant
    if (Tag.Constant === j.tag) {
      const i = j.props
      data = i
    }

    // Reject
    else if (Tag.Reject === j.tag) {
      const i = j.props as E
      const handler = stackE.pop()
      if (handler !== undefined) {
        stackA.push(handler(i))
      } else {
        return rej(i)
      }
    }

    //Resume
    else if (Tag.Resume === j.tag) {
      const i = j.props as Resume
      data = i(data)
    }

    //ResumeM
    else if (Tag.ResumeM === j.tag) {
      const i = j.props as ResumeM
      stackA.push(i(data))
    }

    // Map
    else if (Tag.Map === j.tag) {
      const i = j.props as Map
      stackA.push(FIO.resume(i[1]))
      stackA.push(i[0])
    }

    // Chain
    else if (Tag.Chain === j.tag) {
      const i = j.props as Chain
      stackA.push(FIO.resumeM(i[1]))
      stackA.push(i[0])
    }

    // Catch
    else if (Tag.Catch === j.tag) {
      const i = j.props as Catch
      stackE.push(i[1])
      stackA.push(i[0])
    }

    // Async
    else if (Tag.Async === j.tag) {
      const i = j.props as Async<R, E, A>
      const id = cancellationList.push(
        i(
          env,
          err => {
            cancellationList.remove(id)
            Fiber(
              FIO.reject(err),
              env,
              rej,
              res,
              stackA,
              stackE,
              cancellationList,
              sh
            )
          },
          val => {
            cancellationList.remove(id)
            Fiber(
              FIO.of(val),
              env,
              rej,
              res,
              stackA,
              stackE,
              cancellationList,
              sh
            )
          },
          sh
        )
      )

      return
    }
  }
  res(data as A)
}
