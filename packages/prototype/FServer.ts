import {defaultRuntime, IRuntime, Managed, QIO, UIO} from '@qio/core'
import * as http from 'http'

const Exit = QIO.encase((message: Error) => {
  process.exit(1)
})

interface IQIOServerOptions {
  mounted: {[k: string]: (req: http.IncomingMessage) => UIO<string>}
  port: number
}

class QIOServerBuilder {
  public get serve(): UIO<never> {
    return Managed.make(
      QIO.runtime().encase(RTM => new QIOServer(RTM, this.options)),
      server => server.close
    ).use(QIO.never)
  }
  public static of(): QIOServerBuilder {
    return new QIOServerBuilder({port: 0, mounted: {}})
  }
  private constructor(private readonly options: IQIOServerOptions) {}

  public bind(port: number): QIOServerBuilder {
    return new QIOServerBuilder({...this.options, port})
  }

  public mount(
    path: string,
    fn: (req: http.IncomingMessage) => UIO<string>
  ): QIOServerBuilder {
    return new QIOServerBuilder({
      ...this.options,
      mounted: {...this.options.mounted, [path]: fn}
    })
  }
}

class QIOServer {
  private readonly server: http.Server
  public constructor(
    private readonly RTM: IRuntime,
    private readonly options: IQIOServerOptions
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
    return QIO.uninterruptibleIO<Error, void>((rej, res) => () =>
      this.server.close(E => (E !== undefined ? rej(E) : res()))
    ).catch(Exit)
  }
}

const runtime = defaultRuntime()
runtime.unsafeExecute(
  QIOServerBuilder.of().mount('/greet', () => QIO.of('Hello World!')).serve
)
