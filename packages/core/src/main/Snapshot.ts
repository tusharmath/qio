/**
 * Created by tushar on 07/09/19
 */
import {QIO, UIO} from './QIO'

export class Snapshot<T = string | number> {
  public get timeline(): string[] {
    return this.timelineData.map(_ => _.join('@'))
  }
  public readonly timelineData = new Array<[T, number]>()
  public mark(value: T): UIO<T> {
    return QIO.runtime().chain(RTM =>
      UIO(
        () => void this.timelineData.push([value, RTM.scheduler.now()])
      ).const(value)
    )
  }
}
