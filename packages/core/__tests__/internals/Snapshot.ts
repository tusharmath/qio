/**
 * Created by tushar on 07/09/19
 */
import {FIO, UIO} from '../../packages/core/lib/main/FIO'

export class Snapshot {
  public readonly timeline = new Array<string>()
  public mark(value: string): UIO<void> {
    return FIO.runtime().chain(RTM =>
      UIO(() => void this.timeline.push(value + '@' + RTM.scheduler.now()))
    )
  }
}
