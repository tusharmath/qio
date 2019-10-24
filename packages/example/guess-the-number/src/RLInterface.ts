import {Managed, QIO} from '@qio/core'

import {IProcess, IReadLine} from './Env'

/**
 * Creates a managed ReadLine interface using std in/out
 */
export const rlInterface = Managed.make(
  QIO.access((_: IProcess & IReadLine) =>
    _.readline.createInterface(_.process.stdin, _.process.stdout)
  ),
  QIO.encase(rl => rl.close())
)
