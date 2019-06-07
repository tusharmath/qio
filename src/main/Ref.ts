/**
 * Created by tushar on 2019-05-25
 */
import {FIO, UIO} from './FIO'

export class Ref<A> {
  public static of<A>(a: A): UIO<Ref<A>> {
    return FIO.uio(() => new Ref(a))
  }
  private constructor(private value: A) {}

  public read(): UIO<A> {
    return FIO.uio(() => this.value)
  }
  public set(a: A): UIO<A> {
    return FIO.uio(() => (this.value = a))
  }
  public update(ab: (a: A) => A): UIO<A> {
    return FIO.uio(() => (this.value = ab(this.value)))
  }
}
