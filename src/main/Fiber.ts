import {IO, UIO} from '../main/FIO'

export abstract class Fiber<E, A> {
  public abstract abort(): UIO<void>
  public abstract resume(): IO<E, A>
}
