import {QIO} from '../..'

export class Counter {
  public count = 0
  public get increased(): boolean {
    return this.count > 0
  }
  public inc = (s: number = 1) => QIO.lift(() => (this.count += s))
}
