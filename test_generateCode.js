const { generateCode } = require('./generateCode');

// Example AST for: const a = [1, 2 + 3, true, null, undefined, "hello"];
const ast = {
  type: 'Program',
  body: [
    {
      type: 'VariableDeclaration',
      kind: 'CONST',
      identifier: 'a',
      initializer: {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 1 },
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 2 },
            right: { type: 'Literal', value: 3 }
          },
          { type: 'Literal', value: true },
          { type: 'Literal', value: null },
          { type: 'Literal', value: undefined },
          { type: 'Literal', value: "hello" }
        ]
      }
    }
  ]
};

console.log(generateCode(ast));
