/* tslint:disable: no-unbound-method */

import {FIO} from '../main/FIO'
import {Tag} from '../main/Instructions'

import {FiberContext} from './FiberContext'

/**
 * Evaluates the complete instruction tree
 */
export const Evaluate = <E, A>(context: FiberContext<E, A>): void => {
  const {rej, res, stackA, stackE, cancellationList, sh} = context
  let env = context.env
  let data: unknown

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

    // Never
    else if (Tag.Never === j.tag) {
      return
    }

    // Suspend
    else if (Tag.Suspend === j.tag) {
      const head = stackA.pop()
      if (head !== undefined) {
        stackA.push(j.i0)
        stackA.push(head)
      }
      data = context
    }

    // Provide
    else if (Tag.Provide === j.tag) {
      env = j.i1
      stackA.push(j.i0)
    }
    // Async
    else if (Tag.Async === j.tag) {
      const id = cancellationList.push(
        j.i0(
          env,
          cause => {
            cancellationList.remove(id)
            stackA.push(FIO.reject(cause).toInstruction())
            sh.asap(Evaluate, context)
          },
          val => {
            cancellationList.remove(id)
            stackA.push(FIO.of(val).toInstruction())
            sh.asap(Evaluate, context)
          },
          sh
        )
      )

      return
    } else {
      throw new Error('Invalid Instruction')
    }
  }
}
