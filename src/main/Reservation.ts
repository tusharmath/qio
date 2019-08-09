import {FIO} from './FIO'

export class Reservation<E1, A1, R1> {
  public static of<E1, A1, R1>(
    acquire: FIO<E1, A1, R1>,
    release: FIO<never, void, R1>
  ): Reservation<E1, A1, R1> {
    return new Reservation(acquire, release)
  }
  private constructor(
    public readonly acquire: FIO<E1, A1, R1>,
    public readonly release: FIO<never, void, R1>
  ) {}
}
