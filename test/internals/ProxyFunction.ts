import {assert} from 'chai'

export const $ = <S extends object[], T>(fn: (...t: S) => T) => assert.ok(fn)
