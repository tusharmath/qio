/* tslint:disable: no-unbound-method */

import {FIO} from '../main/FIO'
import {Tag} from '../main/Instructions'

import {CB} from './CB'
import {FiberContext} from './FiberContext'

/**
 * Evaluates the complete instruction tree
 */
export const Evaluate = <E, A>(
  context: FiberContext<E, A>,
  rej: CB<E>,
  res: CB<A>
): void => {
  const {stackA, stackE, cancellationList, sh} = context
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
        stackA.push(FIO.resume(j.i1).asInstruction)
        stackA.push(j.i0)
        break

      case Tag.Chain:
        stackA.push(FIO.resumeM(j.i1).asInstruction)
        stackA.push(j.i0)
        break

      case Tag.Catch:
        stackE.push(j.i1)
        stackA.push(j.i0)
        break

      case Tag.Never:
        return

      case Tag.Fork:
        data = new FiberContext(sh, j.i0, cancellationList, context.env)
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
              stackA.push(FIO.reject(err).asInstruction)
              context.$resume(rej, res)
            },
            val => {
              cancellationList.remove(id)
              stackA.push(FIO.of(val).asInstruction)
              context.$resume(rej, res)
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
