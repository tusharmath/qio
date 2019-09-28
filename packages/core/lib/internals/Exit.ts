import {ICancellable} from 'ts-scheduler'

import {IRuntime} from '../../../../src/runtimes/IRuntime'
import {UIO} from '../main/FIO'
ed by tushar on 08/09/19
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
