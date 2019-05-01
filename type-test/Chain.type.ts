/**
 * Created by tushar on 2019-04-26
 */
import {IO} from '../src/main/IO'

// $ExpectType IO<SchedulerEnv, never, number>
IO.of(10).chain(_ => IO.of(_))

interface E1 {
  e: 'e1'
}
interface E2 {
  e: 'e2'
}

declare const a: IO<{console: Console}, E1, number>
declare const b: IO<{process: NodeJS.Process}, E2, string>

// $ExpectType IO<{ console: Console; } & { process: Process; }, E1 | E2, string>
a.chain(() => b)
