import {QIO, testRuntime} from '@qio/core'
import {assert, spy} from 'chai'

import {FS} from '../lib/FS'

describe('fs', () => {
  context('mock', () => {
    describe('readFile', () => {
      it('should read the file', () => {
        const actual = testRuntime().unsafeExecuteSync(
          FS.readFile('./hello.txt').provide({
            fs: {readFile: path => QIO.resolve('DATA:' + path)}
          })
        )
        const expected = 'DATA:./hello.txt'
        assert.deepStrictEqual(actual, expected)
      })
    })

    describe('open', () => {
      it('should open the file', () => {
        const fsOpen = spy(() => QIO.resolve(10))
        testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w').provide({
            fs: {
              open: fsOpen
            }
          })
        )
        fsOpen.should.be.called.with('./hello.txt', '+w')
      })

      it('should return fd', () => {
        const actual = testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w').provide({
            fs: {
              open: () => QIO.resolve(10)
            }
          })
        )
        const expected = 10
        assert.strictEqual(actual, expected)
      })
    })

    describe('close', () => {
      it('should close with fd', () => {
        const closeSpy = spy()
        testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w')
            .chain(_ => FS.close(_))
            .provide({
              fs: {
                close: QIO.encase(closeSpy),
                open: () => QIO.resolve(10)
              }
            })
        )

        closeSpy.should.be.called.with(10)
      })
    })
  })
})
