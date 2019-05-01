/**
 * Created by tushar on 2019-04-26
 */
import {FIO} from '../src/main/FIO'

// $ExpectType FIO<DefaultEnv, never, number>
FIO.of(10).chain(_ => FIO.of(_))

interface E1 {
  e: 'e1'
}
interface E2 {
  e: 'e2'
}

declare const a: FIO<{console: Console}, E1, number>
declare const b: FIO<{process: NodeJS.Process}, E2, string>

// $ExpectType FIO<{ console: Console; } & { process: Process; }, E1 | E2, string>
a.chain(() => b)
