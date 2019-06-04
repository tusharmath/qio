import {Suite} from 'benchmark'
import {FutureInstance} from 'fluture'

import {FIO} from '../..'
import {noop} from '../../src/internals/Noop'
import {defaultRuntime} from '../../src/runtimes/DefaultRuntime'

import {PrintLn} from './PrintLn'

const runtime = defaultRuntime()

export const RunSuite = (
  name: string,
  test: {
    fio: FIO
    fluture: FutureInstance<unknown, unknown>
  }
) => {
  PrintLn('##', name)
  PrintLn('```')
  const suite = new Suite(name)
  suite
    .add(
      'FIO',
      (cb: IDefer) => {
        runtime.execute(test.fio, () => cb.resolve())
      },
      {defer: true}
    )
    .add(
      'Fluture',
      (cb: IDefer) => {
        test.fluture.fork(noop, () => cb.resolve())
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
            .join('') +
          '\n```'
      )
    })
    .run()
}
