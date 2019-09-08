/* tslint:disable: no-unbound-method */

import {check} from 'checked-exceptions'

import {FIO} from '../main/FIO'
import {Instruction, Tag} from '../main/Instructions'

import {CB} from './CB'
import {FiberContext} from './FiberContext'

const InvalidInstruction = check(
  'InvalidInstruction',
  (ins: Instruction) => `${Tag[ins.tag]}`
)

/**
 * Evaluates the complete instruction tree
 * @ignore
 */
export const Evaluate = <E, A>(
  context: FiberContext<E, A>,
  rej: CB<E>,
  res: CB<A>
): void => {
  const {stackA, stackE, stackEnv, cancellationList, sh, runtime} = context
  let data: unknown

  while (true) {
    try {
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
          const nContext = context.$fork(j.i0)
          cancellationList.push(nContext)
          data = nContext
          break

        case Tag.Provide:
          stackA.push(
            FIO.resume(i => {
              stackEnv.pop()

              return i
            }).asInstruction
          )
          stackA.push(j.i0)
          stackEnv.push(j.i1)
          break

        case Tag.Access:
          const env = stackEnv[stackEnv.length - 1]
          data = j.i0(env)
          break

        case Tag.Runtime:
          data = runtime
          break

        case Tag.Async:
          const id = cancellationList.push(
            j.i0(
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
          stackA.push(FIO.reject(new InvalidInstruction(j)).asInstruction)
      }
    } catch (e) {
      stackA.push(FIO.reject(e).asInstruction)
    }
  }
}
