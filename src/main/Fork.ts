/* tslint:disable: no-unbound-method */

/**
 * Created by tushar on 2019-05-24
 */

import {IScheduler} from 'ts-scheduler'

import {CancellationList} from '../internals/CancellationList'
import {CB} from '../internals/CB'

import {FIO} from './FIO'
import {Instruction, Tag} from './Instructions'

/**
 * Interpret evaluates the complete instruction tree
 */
export const Interpret = <R, E, A>(
  fib: Instruction,
  env: R,
  rej: CB<E>,
  res: CB<A>,
  stackA: Instruction[],
  stackE: Array<(e: unknown) => Instruction>,
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
      stackA.push(FIO.resume(j.i1).toInstruction())
      stackA.push(j.i0)
    }

    // Chain
    else if (Tag.Chain === j.tag) {
      stackA.push(FIO.resumeM(j.i1).toInstruction())
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
            Interpret(
              FIO.reject(cause).toInstruction(),
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
              Interpret,
              FIO.of(val).toInstruction(),
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
