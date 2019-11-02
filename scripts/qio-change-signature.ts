/* tslint:disable */
import {Transformation} from 'ts-codemod'
import * as ts from 'typescript'
Error.stackTraceLimit = Infinity
// my-custom-transformation.ts
export default class QIOChangeSignature extends Transformation {
  public visit(node: ts.Node): ts.VisitResult<ts.Node> {
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      [
        'Fiber',
        'FiberContext',
        'Await',
        'Managed',
        'Stream',
        'Reservation'
      ].indexOf(node.typeName.text) > -1 &&
      node.typeArguments !== undefined
    ) {
      //
      if (node.typeArguments.length === 3) {
        const [E, A, R] = node.typeArguments
        const nTypeArguments = ts.createNodeArray([A, E, R])

        return ts.createTypeReferenceNode(node.typeName, nTypeArguments)
      }
      if (node.typeArguments.length === 2) {
        const [E, A] = node.typeArguments
        const nTypeArguments = ts.createNodeArray([A, E])

        return ts.createTypeReferenceNode(node.typeName, nTypeArguments)
      }
    }

    return node
  }
}
