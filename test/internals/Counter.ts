import {FIO} from '../../src/main/FIO'

export class Counter {
  public count = 0
  public inc = () => FIO.uio(() => ++this.count)
  public get increased(): boolean {
    return this.count > 0
  }
}
