import {defaultRuntime, IRuntime, Managed, QIO} from '@qio/core'
import * as http from 'http'

const Exit = QIO.encase((message: Error) => {
  process.exit(1)
})
interface IQIOServerOptions {
  mounted: {
    [k: string]: (req: http.IncomingMessage) => QIO<string>
  }
  port: number
}
class QIOServerBuilder {
  public static of(): QIOServerBuilder {
    return new QIOServerBuilder({port: 0, mounted: {}})
  }
  private constructor(private readonly options: IQIOServerOptions) {}
  public get serve(): QIO<never> {
    return Managed.make(
      QIO.runtime().encase((RTM) => new QIOServer(RTM, this.options)),
      (server) => server.close
    ).use(QIO.never)
  }

  public bind(port: number): QIOServerBuilder {
    return new QIOServerBuilder({...this.options, port})
  }
  public mount(
    path: string,
    fn: (req: http.IncomingMessage) => QIO<string>
  ): QIOServerBuilder {
    return new QIOServerBuilder({
      ...this.options,
      mounted: {...this.options.mounted, [path]: fn},
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
  public get close(): QIO<void> {
    return QIO.uninterruptible<void, Error>((res, rej) => () =>
      this.server.close((E) => (E !== undefined ? rej(E) : res()))
    ).catch(Exit)
  }

  private readonly onRequest = (
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) => {
    if (req.url !== undefined && this.options.mounted.hasOwnProperty(req.url)) {
      this.RTM.unsafeExecute(
        this.options.mounted[req.url](req).encase((chunk) => res.end(chunk))
      )
    }
  }
}

const runtime = defaultRuntime()
runtime.unsafeExecute(
  QIOServerBuilder.of().mount('/greet', () => QIO.resolve('Hello World!')).serve
)
