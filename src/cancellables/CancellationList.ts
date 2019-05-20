/**
 * Created by tushar on 2019-05-14
 */
import {ICancellable} from 'ts-scheduler'

/**
 * @ignore
 */
export type CancelId = number

/**
 * Collection of cancellables
 * @ignore
 */
export class CancellationList implements ICancellable {
  private q = new Array<ICancellable>()

  public cancel(): void {
    for (let i = 0; i < this.q.length; i++) {
      this.q[i].cancel()
    }
    this.q = []
  }

  public cancelById(id: CancelId): void {
    this.q[id].cancel()
  }

  public push(cancel: ICancellable): CancelId {
    return this.q.push(cancel) - 1
  }
}
