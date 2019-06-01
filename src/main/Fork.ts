/* tslint:disable: no-unbound-method */

/**
 * Created by tushar on 2019-05-24
 */

import {IScheduler} from 'ts-scheduler'

import {CancellationList} from '../internals/CancellationList'
import {CB} from '../internals/CB'

import {Fiber, Tag} from './Fiber'
import {FIO} from './FIO'

/**
 * Fiber is internal to the library.
 * Because its a function only implementation,
 * it has minimum property access which improves runtime performance.
 */
export const Fork = <R, E, A>(
  fib: Fiber,
  env: R,
  rej: CB<E>,
  res: CB<A>,
  stackA: Fiber[],
  stackE: Array<(e: unknown) => Fiber>,
  cancellationList: CancellationList,
  sh: IScheduler
): void => {
  let data: unknown
  stackA.push(fib)
  while (true) {
    const j = stackA.pop()
    if (j === undefined) {
      return res(data as A)
    }

    // Constant
    if (Tag.Constant === j.tag) {
      data = j.i0
    }

    // Reject
    else if (Tag.Reject === j.tag) {
      const cause = j.i0 as E
      const handler = stackE.pop()
      if (handler !== undefined) {
        stackA.push(handler(cause))
      } else {
        return rej(cause)
      }
    }

    //Resume
    else if (Tag.Resume === j.tag) {
      data = j.i0(data)
    }

    //ResumeM
    else if (Tag.ResumeM === j.tag) {
      stackA.push(j.i0(data))
    }

    // Map
    else if (Tag.Map === j.tag) {
      stackA.push(FIO.resume(j.i1).toFiber())
      stackA.push(j.i0)
    }

    // Chain
    else if (Tag.Chain === j.tag) {
      stackA.push(FIO.resumeM(j.i1).toFiber())
      stackA.push(j.i0)
    }

    // Catch
    else if (Tag.Catch === j.tag) {
      stackE.push(j.i1)
      stackA.push(j.i0)
    }

    // Async
    else if (Tag.Async === j.tag) {
      const id = cancellationList.push(
        j.i0(
          env,
          cause => {
            cancellationList.remove(id)
            Fork(
              FIO.reject(cause).toFiber(),
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
            sh.asap(
              Fork,
              FIO.of(val).toFiber(),
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
}
