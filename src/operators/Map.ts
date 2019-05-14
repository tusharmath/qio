/**
 * Created by tushar on 2019-05-14
 */
import {Cancel} from 'ts-scheduler'

import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

class MapExecutor<R1, E1, A1, A2> {
  public constructor(
    public readonly src: FIO<R1, E1, A1>,
    public readonly ab: (a: A1) => A2,
    private readonly env: R1,
    private readonly rej: (e: E1) => void,
    private readonly res: (e: A2) => void,
    private readonly runtime: Runtime,
    private readonly cancellations: Cancel[]
  ) {}

  public execute(): void {
    this.cancellations.push(
      this.src.fork(this.env, this.rej, this.onResolve, this.runtime)
    )
  }

  private readonly onResolve = (a: A1) => {
    this.res(this.ab(a))
  }
}
export class Map<R1, E1, A1, A2> extends FIO<R1, E1, A2> {
  public constructor(
    public readonly src: FIO<R1, E1, A1>,
    public readonly ab: (a: A1) => A2
  ) {
    super()
  }

  public fork(
    env: R1,
    rej: (e: E1) => void,
    res: (e: A2) => void,
    runtime: Runtime
  ): () => void {
    const cancellations = new Array<Cancel>()
    cancellations.push(
      runtime.scheduler.asap(() =>
        new MapExecutor(
          this.src,
          this.ab,
          env,
          rej,
          res,
          runtime,
          cancellations
        ).execute()
      )
    )

    return () => {
      cancellations.forEach(_ => _())
    }
  }
}
