import {IExecutable} from 'ts-scheduler'
import {CB} from './CB'
import {SafeResolve} from './SafeResolve'

/**
 * Class based implementation of SafeResolve function
 * @ignore
 */
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
