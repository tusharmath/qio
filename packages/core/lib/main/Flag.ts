import {QIO} from './QIO'
import {Ref} from './Ref'

export class Flag {
  public static of(value: boolean): QIO<Flag> {
    return Ref.of(value).map((awt) => new Flag(awt))
  }
  private constructor(private readonly flag: Ref<boolean>) {}
  public get check(): QIO<boolean> {
    return this.flag.read
  }

  public set(value: boolean): QIO<boolean> {
    return this.flag.set(value)
  }
}
