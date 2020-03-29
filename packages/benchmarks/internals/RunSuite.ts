/* tslint:disable: no-unbound-method */
import * as T from '@matechs/effect'
import {defaultRuntime, QIO} from '@qio/core'
import {noop} from '@qio/prelude'
import {Suite} from 'benchmark'
import {fork, FutureInstance} from 'fluture'

import {PrintLn} from './PrintLn'

export const qioRuntime = defaultRuntime()

/**
 * Native runs native benchmarks.
 */
export const RUN_NATIVE = false

export const RunSuite = (
  name: string,
  test: {
    bluebird(): PromiseLike<unknown>
    fluture(): FutureInstance<unknown, unknown>
    matechs?(): T.effect.Effect<unknown, unknown, unknown>
    native?(): void
    qio(): QIO
  }
) => {
  PrintLn('##', name)
  PrintLn('```')
  const suite = new Suite(name)

  if (typeof test.native === 'function' && RUN_NATIVE) {
    suite.add('Native', () => {
      ;(test as {native(): void}).native()
    })
  }

  if (typeof test.matechs === 'function') {
    const F = test.matechs
    suite.add(
      'Matechs',
      (cb: IDefer) => T.effect.run(F(), () => cb.resolve()),
      {defer: true}
    )
  }

  suite
    .add(
      'QIO',
      (cb: IDefer) => qioRuntime.unsafeExecute(test.qio(), () => cb.resolve()),
      {defer: true}
    )
    .add(
      'Fluture',
      (cb: IDefer) => fork(noop)(() => cb.resolve())(test.fluture()),
      {defer: true}
    )
    .add('bluebird', (cb: IDefer) => test.bluebird().then(() => cb.resolve()), {
      defer: true,
    })

    .on('cycle', (event: Event) => {
      PrintLn(String(event.target))
    })

    .on('complete', function (this: Suite): void {
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
