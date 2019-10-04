/**
 * Created by tushar on 08/09/19
 */

import {ICancellable} from 'ts-scheduler'

import {FiberContext} from './FiberContext'
import {noop} from './Noop'

/**
 * Executes a FiberContext on cancellation.
 */
export class Exit implements ICancellable {
  public constructor(private readonly ctx: FiberContext<never, void>) {}

  public cancel(): void {
    this.ctx.unsafeExecute(noop, noop)
  }
}
