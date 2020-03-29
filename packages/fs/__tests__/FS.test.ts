import {QIO, testRuntime} from '@qio/core'
import {deepStrictEqual} from 'assert'
import {assert, spy} from 'chai'

import {FS} from '../lib/FS'

describe('fs', () => {
  context('mock', () => {
    describe('readFile', () => {
      it('should read the file', () => {
        const actual = testRuntime().unsafeExecuteSync(
          FS.readFile('./hello.txt').provide({
            fs: {
              readFile: (path) => QIO.resolve(Buffer.from('DATA:' + path)),
            },
          })
        )
        const expected = Buffer.from('DATA:./hello.txt')
        assert.deepStrictEqual(actual, expected)
      })
    })

    describe('open', () => {
      it('should open the file', () => {
        const fsOpen = spy(() => QIO.resolve(10))
        testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w').provide({
            fs: {
              open: fsOpen,
            },
          })
        )
        fsOpen.should.be.called.with('./hello.txt', '+w')
      })

      it('should return fd', () => {
        const actual = testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w').provide({
            fs: {
              open: () => QIO.resolve(10),
            },
          })
        )
        const expected = 10
        assert.deepStrictEqual(actual, expected)
      })
    })

    describe('close', () => {
      it('should close with fd', () => {
        const closeSpy = spy()
        testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w')
            .chain((_) => FS.close(_))
            .provide({
              fs: {
                close: QIO.encase(closeSpy),
                open: () => QIO.resolve(10),
              },
            })
        )

        closeSpy.should.be.called.with(10)
      })

      it('should fail on close()', () => {
        const actual = testRuntime().unsafeExecuteSync(
          FS.open('./hello.txt', '+w')
            .chain((_) => FS.close(_))
            .provide({
              fs: {
                close: () => QIO.reject(new Error('INVALID_FILE')),
                open: () => QIO.resolve(10),
              },
            })
        )

        deepStrictEqual(actual, new Error('INVALID_FILE'))
      })
    })

    describe('writeFile', () => {
      it('should be able to write', () => {
        const writeFile = spy()
        testRuntime().unsafeExecuteSync(
          FS.open('data.txt', 'w')
            .chain((H) => FS.writeFile(H, 'DATA'))
            .provide({
              fs: {
                open: () => QIO.resolve(10),
                writeFile: QIO.encase(writeFile),
              },
            })
        )

        writeFile.should.be.called.with(10, 'DATA')
      })
    })
  })
})
