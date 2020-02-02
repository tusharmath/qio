import {QIO} from './QIO'

export class Reservation<A1, E1, R1> {
  public static of<A1, E1, R1, E2, R2>(
    acquire: QIO<A1, E1, R1>,
    release: QIO<unknown, E2, R2>
  ): Reservation<A1, E1 | E2, R1 & R2> {
    return new Reservation<A1, E1 | E2, R1 & R2>(
      acquire.addEnv(),
      release.addEnv()
    )
  }
  private constructor(
    public readonly acquire: QIO<A1, E1, R1>,
    public readonly release: QIO<unknown, E1, R1>
  ) {}
}
