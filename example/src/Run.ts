/**
 * Created by tushar on 2019-05-05
 */

import {prompt} from 'promptly'

import {defaultRuntime} from '../../'

import {program} from './Program'

defaultRuntime().execute(
  program.provide({
    console: {
      getStrLn: prompt,
      // tslint:disable-next-line:no-console
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
