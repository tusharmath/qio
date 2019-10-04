import * as http from 'http'

import {defaultRuntime, FIO, IRuntime, Managed, UIO} from '../..'
import {IRuntimeEnv} from '../runtimes/IRuntime'

const Exit = FIO.encase((message: Error) => {
  process.exit(1)
})

interface IFIOServerOptions {
  mounted: {[k: string]: (req: http.IncomingMessage) => UIO<string>}
  port: number
}

class FIOServerBuilder {
  public get serve(): FIO<never, never, IRuntimeEnv> {
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
      this.RTM.unsafeExecute(
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

const runtime = defaultRuntime()
runtime.unsafeExecute(
  FIOServerBuilder.of()
    .mount('/greet', () => FIO.of('Hello World!'))
    .serve.provide({runtime})
)
