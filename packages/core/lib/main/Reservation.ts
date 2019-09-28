import {FIO} from './FIO'

export class Reservation<E1, A1, R1> {
  public static of<E1, A1, R1, R2>(
    acquire: FIO<E1, A1, R1>,
    release: FIO<never, void, R2>
  ): Reservation<E1, A1, R1 & R2> {
    return new Reservation(acquire.addEnv(), release.addEnv())
  }

  private constructor(
    public readonly acquire: FIO<E1, A1, R1>,
    public readonly release: FIO<never, void, R1>
  ) {}
}
