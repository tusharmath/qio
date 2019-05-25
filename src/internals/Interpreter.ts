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
export type Next = (value: unknown) => unknown
export type NextM = (value: unknown) => FIO
export type Map = [FIO, (a: unknown) => unknown]
export type Chain = [FIO, (a: unknown) => FIO]
export type Async<R = unknown, E = unknown, A = unknown> = (
  env: R,
  rej: CB<E>,
  res: CB<A>,
  sh: IScheduler
) => ICancellable

/**
 * Interprets the value of the [[FIO]].
 * It is created per execution context.
 * @ignore
 */
export class Interpreter<R> {
  public readonly cancellationList = new CancellationList()
  private readonly stack = new Array<FIO>()
  public constructor(
    private readonly env: R,
    private readonly sh: IScheduler
  ) {}

  public interpret = <E, A>(io: FIO<R, E, A>, rej: CB<E>, res: CB<A>) => {
    const stack = this.stack
    const env = this.env
    let data: unknown
    stack.push(io)
    while (stack.length > 0) {
      const j = stack.pop() as FIO

      // Constant
      if (Tag.Constant === j.tag) {
        const i = j.props
        data = i
      }

      // Reject
      else if (Tag.Reject === j.tag) {
        const i = j.props

        return rej(i as E)
      }

      // AccessM
      else if (Tag.AccessM === j.tag) {
        const i = j.props as AccessM
        stack.push(i(env))
      }

      // Access
      else if (Tag.Access === j.tag) {
        const i = j.props as Access
        data = i(env)
      }

      //Next
      else if (Tag.Next === j.tag) {
        const i = j.props as Next
        data = i(data)
      }

      //NextM
      else if (Tag.NextM === j.tag) {
        const i = j.props as NextM
        stack.push(i(data))
      }

      // Map
      else if (Tag.Map === j.tag) {
        const i = j.props as Map
        stack.push(FIO.next(i[1]))
        stack.push(i[0])
      }

      // Chain
      else if (Tag.Chain === j.tag) {
        const i = j.props as Chain
        stack.push(FIO.nextM(i[1]))
        stack.push(i[0])
      }

      // Async
      else if (Tag.Async === j.tag) {
        const i = j.props as Async<R, E, A>
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
