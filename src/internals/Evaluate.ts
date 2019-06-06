/* tslint:disable: no-unbound-method */

import {FIO} from '../main/FIO'
import {Tag} from '../main/Instructions'

import {FiberContext} from './FiberContext'

/**
 * Evaluates the complete instruction tree
 */
export const Evaluate = <E, A>(context: FiberContext<E, A>): void => {
  const {rej, res, stackA, stackE, cancellationList, sh} = context
  let data: unknown

  while (true) {
    const j = stackA.pop()

    if (j === undefined) {
      return res(data as A)
    }

    switch (j.tag) {
      case Tag.Constant:
        data = j.i0
        break

      case Tag.Reject:
        const cause = j.i0 as E
        const handler = stackE.pop()
        if (handler !== undefined) {
          stackA.push(handler(cause))
        } else {
          return rej(cause)
        }

        break

      case Tag.Try:
        data = j.i0(data)
        break

      case Tag.TryM:
        stackA.push(j.i0(data))
        break

      case Tag.Map:
        stackA.push(FIO.resume(j.i1).toInstruction())
        stackA.push(j.i0)
        break

      case Tag.Chain:
        stackA.push(FIO.resumeM(j.i1).toInstruction())
        stackA.push(j.i0)
        break

      case Tag.Catch:
        stackE.push(j.i1)
        stackA.push(j.i0)
        break

      case Tag.Never:
        return

      case Tag.Suspend:
        const head = stackA.pop()
        if (head !== undefined) {
          stackA.push(j.i0)
          stackA.push(head)
        }
        data = context
        break

      case Tag.Provide:
        context.env = j.i1
        stackA.push(j.i0)
        break

      case Tag.Async:
        const id = cancellationList.push(
          j.i0(
            context.env,
            err => {
              cancellationList.remove(id)
              stackA.push(FIO.reject(err).toInstruction())
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

      default:
        throw new Error('Invalid Instruction')
    }
  }
}
