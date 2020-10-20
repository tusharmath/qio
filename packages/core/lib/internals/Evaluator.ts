/* tslint:disable: no-unbound-method cyclomatic-complexity */
import {Exit} from '../main/Exit'
import {Instruction, Tag} from '../main/Instructions'
import {QIO} from '../main/QIO'

export const Evaluator = {
  evaluatePollOrThrow<A, E>(qio: QIO<A, E>): () => A | undefined {
    const poll = this.evaluatePoll(qio)

    return () => {
      const r = poll()
      if (r !== undefined) {
        switch (r.tag) {
          case Exit.SUCCESS:
            return r.value
          case Exit.FAILURE: {
            throw r.cause
          }
          default:
            return undefined
        }
      }
    }
  },

  evaluatePoll<A, E>(qio: QIO<A, E>): () => Exit<A, E> | undefined {
    let r: Exit<A, E> | undefined
    this.evaluate(qio, (exit) => (r = exit))

    return () => r
  },

  printStack(stack: Instruction[]): void {
    console.log(`[${stack.map((_) => Tag[_.tag]).join(', ')}]`)
  },

  continuation<A1, A2>(cb: (A: A1) => A2): QIO<A2> {
    return new QIO(Tag.Continuation, cb)
  },

  halt<A1>(cb: (A: A1) => Instruction): Instruction {
    return new QIO(Tag.Halt, cb).asInstruction
  },

  evaluate<A, E>(
    qio: QIO<A, E>,
    cb: (_: Exit<A, E>) => void,
    stackA: Instruction[] = [],
    ss?: unknown
  ): void {
    stackA.push(qio.asInstruction)
    let s: unknown = ss
    while (true) {
      const i = stackA.pop()
      if (i === undefined) {
        return cb(Exit.succeed(s as A))
      }

      switch (i.tag) {
        case Tag.Access:
          break

        case Tag.ExitCallback:
          i.i0((exit) => {
            const q = QIO.fromExit(exit as Exit<A, E>)
            this.evaluate(q, cb, stackA)
          })

          return

        case Tag.Halt:
          break

        case Tag.Catch:
          stackA.push(this.halt(i.i1))
          stackA.push(i.i0)
          break

        case Tag.Chain:
          const k = i.i0
          switch (k.tag) {
            case Tag.Resolve:
              stackA.push(i.i1(k.i0))
              break
            default:
              stackA.push(this.continuation(i.i1).asInstruction)
              stackA.push(i.i0)
          }
          break

        case Tag.Resolve:
          s = i.i0
          break

        case Tag.Fork:
          break

        case Tag.Never:
          break

        case Tag.Provide:
          break

        case Tag.Reject:
          while (
            stackA.length > 0 &&
            stackA[stackA.length - 1].tag !== Tag.Halt
          ) {
            stackA.pop()
          }

          s = i.i0

          const cause = i.i0 as E
          const f = stackA.pop()

          if (f !== undefined && f.tag === Tag.Halt) {
            stackA.push(f.i0(cause))
          } else {
            return cb(Exit.fail(cause))
          }
          break

        case Tag.Continuation:
          stackA.push(i.i0(s))
          break

        case Tag.EffectTotal:
          s = i.i0()
          break

        default:
          throw new Error(`Invalid Instruction ${Tag[i.tag]}`)
      }
    }
  },
}
