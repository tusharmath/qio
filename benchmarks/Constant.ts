/**
 * Created by tushar on 2019-05-09
 */
import {Suite} from 'benchmark'
import * as Fluture from 'fluture'
import {noop} from '../src/internals/Noop'

import {FIO} from '../src/main/FIO'
import {defaultRuntime} from '../src/runtimes/DefaultRuntime'

import {PrintLn} from './internals/PrintLn'

const suite = new Suite()

const fluture = Fluture.of(10)
const fio = FIO.of(10)
const runtime = defaultRuntime(undefined)
suite
  .add(
    'FIO',
    (cb: IDefer) => {
      runtime.execute(fio, () => cb.resolve())
    },
    {defer: true}
  )
  .add(
    'Fluture',
    (cb: IDefer) => {
      fluture.fork(noop, () => cb.resolve())
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
