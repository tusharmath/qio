/**
 * Created by tushar on 2019-05-11
 */
import {Suite} from 'benchmark'
import * as Fluture from 'fluture'

import {noop} from '../src/internals/Noop'
import {FIO2, interpretSyncFIO2} from '../src/main/FIO2'
import {inc} from './internals/Inc'
import {PrintLn} from './internals/PrintLn'

const suite = new Suite('NestedMap')

const MAX = 1e3
const nothing = () => {}

let fluture = Fluture.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fluture = fluture.map(inc)
}

let fio2 = FIO2.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fio2 = fio2.map(inc)
}

interface Defer {
  reject(): void
  resolve(): void
}

suite
  .add(
    'FIO2',
    (cb: Defer) => {
      interpretSyncFIO2(fio2, undefined, [], noop, () => cb.resolve())
    },
    {defer: true}
  )
  .add(
    'Fluture',
    (cb: Defer) => {
      fluture.fork(nothing, () => cb.resolve())
    },
    {defer: true}
  )

  .on('cycle', (event: Event) => {
    PrintLn(String(event.target))
  })
  .on('complete', function(this: Suite): void {
    PrintLn(
      'Fastest is ' +
        this.filter('fastest')
          .map((i: {name: string}) => i.name)
          .join('')
    )
  })
  .run()
