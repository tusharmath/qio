/**
 * Created by tushar on 2019-05-09
 */
import {Suite} from 'benchmark'
import * as Fluture from 'fluture'
import {noop} from '../src/internals/Noop'

import {FIO2, interpretSyncFIO2} from '../src/main/FIO2'

import {PrintLn} from './internals/PrintLn'

const suite = new Suite()

const fluture = Fluture.of(10)
const fio2 = FIO2.of(10)
const nothing = () => {}
interface Defer {
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
