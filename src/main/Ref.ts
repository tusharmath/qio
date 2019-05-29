/**
 * Created by tushar on 2019-05-25
 */
import {DeepReadonly} from 'utility-types'

import {FIO, UIO} from './FIO'

export class Ref<A> {
  private constructor(private value: A) {}
  public static of<A>(a: A): UIO<Ref<A>> {
    return FIO.uio(() => new Ref(a))
  }

  public read(): UIO<A> {
    return FIO.uio(() => this.value)
  }
  public set(a: A): UIO<A> {
    return FIO.uio(() => (this.value = a))
  }
  public update(ab: (a: DeepReadonly<A>) => A): UIO<A> {
    return FIO.uio(() => (this.value = ab(this.value as DeepReadonly<A>)))
  }
}
