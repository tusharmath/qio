import {check} from 'checked-exceptions'
import {IScheduler} from 'ts-scheduler'

import {FIO} from '../main/FIO'
import {Instruction, Tag} from '../main/Instructions'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {FiberContext} from './FiberContext'

/* tslint:disable: no-unbound-method cyclomatic-complexity */
const InvalidInstruction = check(
  'InvalidInstruction',
  (ins: Instruction) => `${Tag[ins.tag]}`
)

/**
 * Unsafely evaluates a FIO expression.
 */
export const unsafeEvaluate = <E, A>(_: {
  cancellationList: CancellationList
  rej: CB<E>
  res: CB<A>
  scheduler: IScheduler
  stackA: Instruction[]
  stackEnv: unknown[]
}) => {
  let data: unknown

  while (true) {
    try {
      const j = _.stackA.pop()

      if (j === undefined) {
        return _.res(data as A)
      }

      switch (j.tag) {
        case Tag.Constant:
          data = j.i0
          break

        case Tag.Call:
          _.stackA.push(j.i0(...j.i1))
          break

        case Tag.Reject:
          while (
            _.stackA.length > 0 &&
            _.stackA[_.stackA.length - 1].tag !== Tag.Capture
          ) {
            _.stackA.pop()
          }
          const cause = j.i0 as E
          const handler = _.stackA.pop()
          if (handler !== undefined && handler.tag === Tag.Capture) {
            _.stackA.push(handler.i0(cause))
          } else {
            return _.rej(cause)
          }
          break

        case Tag.Try:
          data = j.i0(data)
          break

        case Tag.TryM:
          _.stackA.push(j.i0(data))
          break

        case Tag.Map:
          _.stackA.push(FIO.resume(j.i1).asInstruction)
          _.stackA.push(j.i0)
          break

        case Tag.Capture:
          break

        case Tag.Chain:
          _.stackA.push(FIO.resumeM(j.i1).asInstruction)
          _.stackA.push(j.i0)
          break

        case Tag.Catch:
          _.stackA.push(FIO.capture(j.i1).asInstruction)
          _.stackA.push(j.i0)
          break

        case Tag.Never:
          return

        case Tag.Fork:
          // Using the `new` operator because FiberContext.of() needs an IO.
          // Computation should continue in the background.
          // A new context is created so that computation from that instruction can happen separately.
          // and then join back into the current context.
          // Using the same stack will corrupt it completely.
          const nContext = new FiberContext(_.scheduler, j.i0)
          _.cancellationList.push(nContext)
          data = nContext
          break

        case Tag.Provide:
          _.stackA.push(
            FIO.resume(i => {
              _.stackEnv.pop()

              return i
            }).asInstruction
          )
          _.stackA.push(j.i0)
          _.stackEnv.push(j.i1)
          break

        case Tag.Access:
          const env = _.stackEnv[_.stackEnv.length - 1]
          data = j.i0(env)
          break

        case Tag.Async:
          const id = _.cancellationList.push(
            j.i0(
              err => {
                _.cancellationList.remove(id)
                _.stackA.push(FIO.reject(err).asInstruction)
                unsafeEvaluate(_)
              },
              val => {
                _.cancellationList.remove(id)
                _.stackA.push(FIO.of(val).asInstruction)
                unsafeEvaluate(_)
              }
            )
          )

          return

        default:
          _.stackA.push(FIO.reject(new InvalidInstruction(j)).asInstruction)
      }
    } catch (e) {
      _.stackA.push(FIO.reject(e).asInstruction)
    }
  }
}
