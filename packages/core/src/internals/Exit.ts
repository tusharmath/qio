import {ICancellable} from 'ts-scheduler'

import {UIO} from '../main/FIO'
import {IRuntime} from '../runtimes/IRuntime'

/**
 * Created by tushar on 08/09/19
 */

export class Exit implements ICancellable {
  public constructor(
    private readonly uio: UIO<void>,
    private readonly runtime: IRuntime
  ) {}

  public cancel(): void {
    this.runtime.execute(this.uio)
  }
}
