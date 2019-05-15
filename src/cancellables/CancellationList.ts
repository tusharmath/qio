/**
 * Created by tushar on 2019-05-14
 */
import {LinkedList, LinkedListNode} from 'dbl-linked-list-ds'

import {ICancellable} from 'ts-scheduler'

/**
 * Collection of cancellables
 * @ignore
 */
export class CancellationList {
  private readonly q = new LinkedList<ICancellable>()

  public cancel = (): void => {
    this.q.forEach(_ => _.value.cancel())
  }

  public cancelId(node: LinkedListNode<ICancellable>): void {
    node.value.cancel()
    this.q.remove(node)
  }

  public push(cancel: ICancellable): LinkedListNode<ICancellable> {
    return this.q.add(cancel)
  }
}
