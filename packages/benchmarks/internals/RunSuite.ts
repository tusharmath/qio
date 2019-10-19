/* tslint:disable: no-unbound-method */
import {noop} from '@fio/core/internals/Noop'
import {UIO} from '@fio/core/main/FIO'
import {defaultRuntime} from '@fio/core/runtimes/DefaultRuntime'
import {Suite} from 'benchmark'
import {FutureInstance} from 'fluture'

import {PrintLn} from './PrintLn'

export const fioRuntime = defaultRuntime()

export const RunSuite = (
  name: string,
  test: {
    bluebird(): PromiseLike<unknown>
    fio(): UIO<unknown>
    fluture(): FutureInstance<unknown, unknown>
    native?(): void
  }
) => {
  PrintLn('##', name)
  PrintLn('```')
  const suite = new Suite(name)

  if (typeof test.native === 'function') {
    suite.add('Native', () => {
      ;(test as {native(): void}).native()
    })
  }

  suite
    .add(
      'FIO',
      (cb: IDefer) => fioRuntime.unsafeExecute(test.fio(), () => cb.resolve()),
      {defer: true}
    )
    .add(
      'Fluture',
      (cb: IDefer) => test.fluture().fork(noop, () => cb.resolve()),
      {defer: true}
    )
    .add('bluebird', (cb: IDefer) => test.bluebird().then(() => cb.resolve()), {
      defer: true
    })

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
