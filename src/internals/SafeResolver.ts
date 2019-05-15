import {IExecutable} from 'ts-scheduler'
import {CB} from './CB'
import {SafeResolve} from './SafeResolve'

export class SafeResolver<A> implements IExecutable {
  public constructor(
    private readonly value: A,
    private readonly rej: CB<never>,
    private readonly res: CB<A>
  ) {}

  public execute(): void {
    SafeResolve(this.value, this.rej, this.res)
  }
}
