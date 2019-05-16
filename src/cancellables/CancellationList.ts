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
export class CancellationList {
  private readonly q = new Array<ICancellable>()

  public cancel(): void {
    let node = this.q.pop()
    while (node !== undefined) {
      node.cancel()
      node = this.q.pop()
    }
  }

  public cancelId(id: CancelId): void {
    const node = this.q[id]
    node.cancel()

    this.q[id] = this.q[this.q.length - 1]
    this.q.pop()
  }

  public push(cancel: ICancellable): CancelId {
    return this.q.push(cancel) - 1
  }
}
