/**
 * Created by tushar on 07/09/19
 */
import {FIO, UIO} from '../../src/main/FIO'

export class Snapshot<T = string | number> {
  public readonly timeline = new Array<string>()
  public mark(value: T): UIO<T> {
    return FIO.runtime().chain(RTM =>
      UIO(
        () => void this.timeline.push(value + '@' + RTM.scheduler.now())
      ).const(value)
    )
  }
}
