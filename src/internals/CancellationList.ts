/**
 * Created by tushar on 2019-05-24
 */
import {LinkedList, LinkedListNode} from 'dbl-linked-list-ds'
import {ICancellable} from 'ts-scheduler'

/**
 * @ignore
 */

export type CancelId = LinkedListNode<ICancellable>

/**
 * @ignore
 */
export class CancellationList implements ICancellable {
  private cancelled = false
  private readonly Q = new LinkedList<ICancellable>()

  public cancel(): void {
    this.cancelled = true
    let node = this.Q.pop()
    while (node !== undefined) {
      node.cancel()
      node = this.Q.pop()
    }
  }

  public get isCancelled(): boolean {
    return this.cancelled
  }

  public push(cancellable: ICancellable): CancelId {
    return this.Q.add(cancellable)
  }

  public remove(id: CancelId): void {
    this.Q.remove(id)
  }
}
