// formatter.js
// Pretty-prints AST to source code, using customizable settings

const defaultSettings = {
  maxLineLength: 80,
  indent: 2,
  spaceAroundOperators: true,
  spaceAfterComma: true,
  breakALines: true,
  // Add more settings as needed
};

function format(ast, settings = {}) {
  const opts = { ...defaultSettings, ...settings };
  let output = '';
  let indentLevel = 0;

  function indent() {
    return ' '.repeat(opts.indent * indentLevel);
  }

  function joinWithSpace(a, b) {
    return opts.spaceAroundOperators ? ` ${a} ${b}` : `${a}${b}`;
  }

  function formatNode(node) {
    switch (node.type) {
      case 'Program':
        return node.body.map(formatNode).join('\n');
      case 'VariableDeclaration':
        return (
          indent() +
          node.kind.toLowerCase() + ' ' +
          node.identifier +
          (node.initializer ? ' = ' + formatNode(node.initializer) : '') +
          ';'
        );
      case 'FunctionDeclaration':
        return (
          indent() +
          'function ' + node.id.name +
          '(' + node.params.map(p => p.name).join(', ') + ') ' +
          formatNode(node.body)
        );
      case 'BlockStatement':
        // Increase indent level for everything inside the block
        indentLevel++;
        // Format each statement in the block, joining with newlines
        const body = node.body.map(stmt => {
          // Make sure each statement is properly indented
          return indent() + formatNode(stmt);
        }).join('\n');
        indentLevel--;
        return '{\n' + body + '\n' + indent() + '}';
      case 'ReturnStatement':
        return indent() + 'return' + (node.argument ? ' ' + formatNode(node.argument) : '') + ';';
      case 'IfStatement': {
        let str = indent() + 'if (' + formatNode(node.test) + ') ' + formatNode(node.consequent);
        if (node.alternate) {
          str += ' else ' + formatNode(node.alternate);
        }
        return str;
      }
      case 'ForStatement': {
        // Format the for loop header
        const header =
          indent() +
          'for (' +
          (node.init ? formatNode(node.init) : '') + '; ' +
          (node.test ? formatNode(node.test) : '') + '; ' +
          (node.update ? formatNode(node.update) : '') + ')';

        // Handle the body formatting based on type
        if (node.body.type === 'BlockStatement') {
          // For block statements, add a space before the block
          return header + ' ' + formatNode(node.body);
        } else {
          // For single statements, indent on a new line
          indentLevel++;
          const formattedBody = indent() + formatNode(node.body);
          indentLevel--;
          return header + '\n' + formattedBody;
        }
      }
      case 'ArrowFunctionExpression': {
        const params = node.params.map(p => p.name).join(', ');
        if (node.body.type === 'BlockStatement') {
          return '(' + params + ') => ' + formatNode(node.body);
        } else {
          return '(' + params + ') => ' + formatNode(node.body);
        }
      }
      case 'CallExpression':
        return (
          formatNode(node.callee) +
          '(' + node.arguments.map(formatNode).join(opts.spaceAfterComma ? ', ' : ',') + ')'
        );
      case 'MemberExpression':
        return (
          formatNode(node.object) +
          (node.computed
            ? '[' + formatNode(node.property) + ']'
            : '.' + node.property.name)
        );
      case 'BinaryExpression':
        return (
          formatNode(node.left) +
          (opts.spaceAroundOperators ? ' ' : '') +
          node.operator +
          (opts.spaceAroundOperators ? ' ' : '') +
          formatNode(node.right)
        );
      case 'ObjectExpression': {
        if (opts.breakALines && node.properties.length > 0) {
          indentLevel++;
          const props = node.properties
            .map(
              prop =>
                indent() + prop.key + ': ' + formatNode(prop.value)
            )
            .join((opts.spaceAfterComma ? ',\n' : ',\n'));
          indentLevel--;
          return '{\n' + props + '\n' + indent() + '}';
        } else {
          return (
            '{' +
            node.properties
              .map(
                prop =>
                  prop.key + ': ' + formatNode(prop.value)
              )
              .join(opts.spaceAfterComma ? ', ' : ',') +
            '}'
          );
        }
      }
      case 'ArrayExpression': {
        if (opts.breakALines && node.elements.length > 0) {
          indentLevel++;
          const elems = node.elements
            .map(e => indent() + formatNode(e))
            .join((opts.spaceAfterComma ? ',\n' : ',\n'));
          indentLevel--;
          return '[\n' + elems + '\n' + indent() + ']';
        } else {
          return (
            '[' +
            node.elements.map(formatNode).join(opts.spaceAfterComma ? ', ' : ',') +
            ']'
          );
        }
      }
      case 'Literal':
        return node.value === undefined ? 'undefined' : JSON.stringify(node.value);
      case 'Identifier':
        return node.name;
      case 'Comment':
        return indent() + node.value;
      case 'AssignmentExpression':

        return (
          formatNode(node.left) +
          (opts.spaceAroundOperators ? ' ' : '') +
          node.operator +
          (opts.spaceAroundOperators ? ' ' : '') +
          formatNode(node.right)
        );
      case 'UpdateExpression':
        return (
          formatNode(node.argument) +
          (node.prefix ? node.operator : '') +
          (node.prefix ? '' : formatNode(node.argument))
        );
      default:
        throw new Error('Unknown AST node type: ' + node.type);
    }
  }

  output = formatNode(ast);
  return output;
}

module.exports = { format, defaultSettings };
