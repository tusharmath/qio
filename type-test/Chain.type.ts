/**
 * Created by tushar on 2019-04-26
 */
import {IO} from '../src/main/IO'

// $ExpectType IO<SchedulerEnv, number>
IO.of(10).chain(_ => IO.of(_))

declare const a: IO<{console: Console}, void>
declare const b: IO<{process: NodeJS.Process}, string>

// $ExpectType IO<{ console: Console; } & { process: Process; }, string>
a.chain(() => b)
