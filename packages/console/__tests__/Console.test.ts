/**
 * Created by tushar on 07/11/19
 */

import {testRuntime} from '@qio/core'
import {assert} from 'chai'

import {getStrLn, putStrLn, testTTY} from '../lib/Console'

describe('Console', () => {
  describe('putStrLn()', () => {
    it('should log content on the screen', () => {
      const tty = testTTY()
      testRuntime().unsafeExecuteSync(putStrLn('HELLO WORLD').provide({tty}))
      const actual = tty.stdout
      const expected = ['HELLO WORLD']
      assert.deepStrictEqual(actual, expected)
    })

    it('should join multiple args', () => {
      const tty = testTTY()
      testRuntime().unsafeExecuteSync(putStrLn('HELLO', 'WORLD').provide({tty}))
      const actual = tty.stdout
      const expected = ['HELLO WORLD']
      assert.deepStrictEqual(actual, expected)
    })

    it('should convert data to string', () => {
      const tty = testTTY()
      testRuntime().unsafeExecuteSync(putStrLn({}).provide({tty}))
      const actual = tty.stdout
      const expected = ['[object Object]']
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('getStrLn()', () => {
    it('should read from the provided questions', () => {
      const tty = testTTY({'name ?': ['QIO']})

      const actual = testRuntime().unsafeExecuteSync(
        getStrLn('name ?').provide({tty})
      )
      const expected = 'QIO'

      assert.strictEqual(actual, expected)
    })

    it('should print on stdout', () => {
      const tty = testTTY({'name: ': ['QIO']})

      testRuntime().unsafeExecuteSync(getStrLn('name: ').provide({tty}))

      const actual = tty.stdout
      const expected = ['name: QIO']

      assert.deepStrictEqual(actual, expected)
    })

    context('no answer provided', () => {
      it('should keep waiting', () => {
        const tty = testTTY({A: ['P', 'Q']})

        const actual = testRuntime().unsafeExecuteSync(
          getStrLn('B').provide({tty})
        )

        assert.isUndefined(actual)
      })

      it('should print on stdout', () => {
        const tty = testTTY({'name: ': []})

        testRuntime().unsafeExecuteSync(getStrLn('name: ').provide({tty}))

        const actual = tty.stdout
        const expected = ['name: ']

        assert.deepStrictEqual(actual, expected)
      })
    })
  })
})
