import {inNode} from 'in-node'

/**
 * Default onError handler. It logs the error on `stderr` stream and exits with a status code 1.
 * @ignore
 */
export const onError = <E>(e: E) => {
  // tslint:disable-next-line:no-console
  console.error(e)
  if (inNode) {
    process.exit(1)
  }
}
