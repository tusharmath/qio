/* tslint:disable: no-import-side-effect ordered-imports no-console */

/**
 * Created by tushar on 2019-05-05
 */

import 'source-map-support/register'

import {prompt} from 'promptly'

import {defaultRuntime} from '../../../src/runtimes/DefaultRuntime'

import {program} from './Program'

defaultRuntime().execute(
  program.provide({
    console: {
      getStrLn: prompt,
      putStrLn: (message: string) => console.log(message)
    },
    random: {
      random: () => Math.random()
    },
    system: {
      exit(code: number): void {
        process.exit(code)
      }
    }
  })
)
