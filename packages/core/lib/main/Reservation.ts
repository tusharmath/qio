import {QIO} from './QIO'

export class Reservation<E1, A1, R1> {
  public static of<E1, A1, R1, R2>(
    acquire: QIO<E1, A1, R1>,
    release: QIO<never, void, R2>
  ): Reservation<E1, A1, R1 & R2> {
    return new Reservation(acquire.addEnv(), release.addEnv())
  }

  private constructor(
    public readonly acquire: QIO<E1, A1, R1>,
    public readonly release: QIO<never, void, R1>
  ) {}
}
