import * as http from 'http'

import {defaultRuntime, FIO, IRuntime, Managed, UIO} from '../..'

const Exit = FIO.encase((message: Error) => {
  process.exit(1)
})

interface IFIOServerOptions {
  mounted: {[k: string]: (req: http.IncomingMessage) => UIO<string>}
  port: number
}

class FIOServerBuilder {
  public get serve(): UIO<never> {
    return Managed.make(
      FIO.runtime().encase(RTM => new FIOServer(RTM, this.options)),
      server => server.close
    ).use(FIO.never)
  }
  public static of(): FIOServerBuilder {
    return new FIOServerBuilder({port: 0, mounted: {}})
  }
  private constructor(private readonly options: IFIOServerOptions) {}

  public bind(port: number): FIOServerBuilder {
    return new FIOServerBuilder({...this.options, port})
  }

  public mount(
    path: string,
    fn: (req: http.IncomingMessage) => UIO<string>
  ): FIOServerBuilder {
    return new FIOServerBuilder({
      ...this.options,
      mounted: {...this.options.mounted, [path]: fn}
    })
  }
}

class FIOServer {
  private readonly server: http.Server
  public constructor(
    private readonly RTM: IRuntime,
    private readonly options: IFIOServerOptions
  ) {
    this.server = http.createServer(this.onRequest).listen(this.options.port)
  }

  private readonly onRequest = (
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) => {
    if (req.url !== undefined && this.options.mounted.hasOwnProperty(req.url)) {
      this.RTM.execute(
        this.options.mounted[req.url](req).encase(chunk => res.end(chunk))
      )
    }
  }

  public get close(): UIO<void> {
    return FIO.asyncIO<Error, void>((rej, res, sh) =>
      sh.asap(() => this.server.close(E => (E !== undefined ? rej(E) : res())))
    ).catch(Exit)
  }
}

defaultRuntime().execute(
  FIOServerBuilder.of().mount('/greet', () => FIO.of('Hello World!')).serve
)
