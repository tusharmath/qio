/**
 * Created by tushar on 2019-05-24
 */

import {IScheduler} from 'ts-scheduler'

import {Instruction} from '../main/Instructions'

import {CancellationList} from './CancellationList'
import {CB} from './CB'

export class FiberContext<E, A> {
  public constructor(
    public readonly env: unknown,
    public readonly rej: CB<E>,
    public readonly res: CB<A>,
    public readonly sh: IScheduler,
    public readonly cancellationList: CancellationList = new CancellationList(),
    public readonly stackA: Instruction[] = [],
    public readonly stackE: Array<(e: unknown) => Instruction> = []
  ) {}
}
