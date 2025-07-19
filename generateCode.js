// AST to JavaScript code generator (pretty-printer)
function generateCode(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(generateCode).join('\n');
    case 'VariableDeclaration':
      return `${node.kind.toLowerCase()} ${node.identifier} = ${generateCode(node.initializer)};`;
    case 'Literal':
      // Print booleans, null, undefined, numbers, and strings correctly
      if (typeof node.value === 'string') return JSON.stringify(node.value);
      if (node.value === null) return 'null';
      if (node.value === undefined) return 'undefined';
      return String(node.value);
    case 'Identifier':
      return node.name;
    case 'BinaryExpression':
      return `${generateCode(node.left)} ${node.operator} ${generateCode(node.right)}`;
    case 'ArrayExpression':
      return `[${node.elements.map(generateCode).join(', ')}]`;
    case 'ObjectExpression':
      return `{${node.properties.map(
        prop => `${prop.key}: ${generateCode(prop.value)}`
      ).join(', ')}}`;
    case 'ReturnStatement':
      return `return${node.argument ? ' ' + generateCode(node.argument) : ''};`;
    case 'BlockStatement':
      return `{
${node.body.map(generateCode).join('\n')}
}`;
    case 'FunctionDeclaration':
      return `function ${node.id.name}(${node.params.map(p => p.name).join(', ')}) ${generateCode(node.body)}`;
    case 'IfStatement': {
      let code = `if (${generateCode(node.test)}) ${generateCode(node.consequent)}`;
      if (node.alternate) code += ` else ${generateCode(node.alternate)}`;
      return code;
    }
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

module.exports = { generateCode };
