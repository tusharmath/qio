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
 * Interprets the value of the [[FIO]].
 * It is created per execution context.
 *
 * A hunk of just high performance code that has no structure but does the job.
 * @ignore
 */
export class Interpreter<RR> {
  public readonly cancellationList = new CancellationList()
  private readonly stackE = new Array<(u: unknown) => FIO>()
  private readonly stackA = new Array<FIO>()

  public constructor(
    private readonly env: RR,
    private readonly sh: IScheduler
  ) {}

  public interpret = <R, E, A>(io: FIO<R, E, A>, rej: CB<E>, res: CB<A>) => {
    const stackA = this.stackA
    const stackE = this.stackE

    const env = this.env
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

      // AccessM
      else if (Tag.AccessM === j.tag) {
        const i = j.props as AccessM
        stackA.push(i(env))
      }

      // Access
      else if (Tag.Access === j.tag) {
        const i = j.props as Access
        data = i(env)
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
        const i = j.props as Async<RR, E, A>
        const id = this.cancellationList.push(
          i(
            env,
            err => {
              this.cancellationList.remove(id)
              this.interpret(FIO.reject(err), rej, res)
            },
            val => {
              this.cancellationList.remove(id)
              this.interpret(FIO.of(val), rej, res)
            },
            this.sh
          )
        )

        return
      }
    }
    res(data as A)
  }
}
