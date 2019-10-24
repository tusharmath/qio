/**
 * Created by tushar on 07/09/19
 */
import {QIO, UIO} from '../../src/main/QIO'

export class Snapshot<T = string | number> {
  public readonly timeline = new Array<string>()
  public mark(value: T): UIO<T> {
    return QIO.runtime().chain(RTM =>
      UIO(
        () => void this.timeline.push(value + '@' + RTM.scheduler.now())
      ).const(value)
    )
  }
}
