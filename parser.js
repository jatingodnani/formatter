/**
 * Parser for converting tokens into an Abstract Syntax Tree (AST)
 * This parser uses a recursive descent approach to build the structure of the code.
 */

function parser(tokens) {
    let current = 0;

    // Helper to get the current token
    function peek() {
        return tokens[current];
    }

    // Helper to consume a token and move to the next
    function consume(expectedType) {
        const token = peek();
        if (token.type === expectedType) {
            current++;
            return token;
        } else {
            throw new Error(`Expected token type ${expectedType} but got ${token.type} at position ${token.position}`);
        }
    }

    // Main parsing function to process the token stream into an AST
    function parseProgram() {
        const ast = {
            type: 'Program',
            body: []
        };
        while (peek().type !== 'EOF') {
            const statement = parseStatement();
            ast.body.push(statement);
        }
        return ast;
    }

    // Parse function parameters
    function parseFunctionParameters() {
        const params = [];
        consume('LEFT_PAREN');
        while (peek().type !== 'RIGHT_PAREN' && peek().type !== 'EOF') {
            const param = consume('IDENTIFIER');
            params.push({
                type: 'Identifier',
                name: param.value
            });
            if (peek().type === 'COMMA') {
                consume('COMMA');
            }
        }
        consume('RIGHT_PAREN');
        return params;
    }

    // Parse a function declaration
    function parseFunctionDeclaration() {
        consume('FUNCTION');
        const id = consume('IDENTIFIER');
        const params = parseFunctionParameters();

        const body = {
            type: 'BlockStatement',
            body: []
        };

        consume('LEFT_CURLY');
        while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
            body.body.push(parseStatement());
        }
        consume('RIGHT_CURLY');

        return {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: id.value
            },
            params,
            body
        };
    }

    // Parse a single statement (e.g., variable declaration, return, if, etc.)
    function parseStatement() {
        const token = peek();
        console.log(`Parsing statement at position ${token.position}: ${token.type}`);
        if (token.type === 'FUNCTION') {
            return parseFunctionDeclaration();
        } else if (token.type === 'CONST' || token.type === 'LET' || token.type === 'VAR') {
            return parseVariableDeclaration();
        } else if (token.type === 'RETURN') {
            console.log('Parsing return statement...');
            return parseReturnStatement();
        } else if (token.type === 'IF') {
            return parseIfStatement();
        }
        else if (token.type === 'LEFT_CURLY') {
            const node = {
                type: 'BlockStatement',
                body: []
            };
            consume('LEFT_CURLY');
            while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
                node.body.push(parseStatement());
            }
            consume('RIGHT_CURLY');
            return node;
        } else if (token.type === 'NUMBER' || token.type === 'IDENTIFIER' || token.type === 'LEFT_PAREN') {
            return parseExpression();
        }else if (token.type === 'FOR') {
            return forStatement();
        }else if(token.type ==="COMMENT"){
            return parseComment();
        }
        // Add more statement types here as needed
        throw new Error(`Unexpected token type ${token.type} for statement at position ${token.position}`);
    }

    // Parse a variable declaration like 'const x = 2;'
    function parseVariableDeclaration() {
        const token = peek();
        const node = {
            type: 'VariableDeclaration',
            kind: consume(token.type).type, // Use the matched token type (CONST, LET, VAR)
            identifier: consume('IDENTIFIER').value,
            initializer: null
        };
        if (peek().type === 'EQUALS') {
            consume('EQUALS');
            node.initializer = parseExpression();
        }
        // Optionally consume semicolon if required by grammar
        if (peek().type === 'SEMICOLON') {
            consume('SEMICOLON');
        }
        return node;
    }

    // Parse a return statement like 'return 5;'
    function parseReturnStatement() {
        const node = {
            type: 'ReturnStatement',
            argument: null
        };
        consume('RETURN');
        if (peek().type !== 'SEMICOLON' && peek().type !== 'EOF') {
            node.argument = parseExpression();
        }
        if (peek().type === 'SEMICOLON') {
            consume('SEMICOLON');
        }
        return node;
    }

    // Parse an if statement like 'if (condition) { ... } else { ... }'
    function parseIfStatement() {
        const node = {
            type: 'IfStatement',
            test: null,
            consequent: null,
            alternate: null
        };
        consume('IF');
        consume('LEFT_PAREN');
        node.test = parseExpression();
        consume('RIGHT_PAREN');
        if (peek().type === 'LEFT_CURLY') {
            consume('LEFT_CURLY');
            node.consequent = {
                type: 'BlockStatement',
                body: []
            };
            while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
                node.consequent.body.push(parseStatement());
            }
            consume('RIGHT_CURLY');
        } else {
            node.consequent = parseStatement();
        }
        if (peek().type === 'ELSE') {
            consume('ELSE');
            if (peek().type === 'LEFT_CURLY') {
                consume('LEFT_CURLY');
                node.alternate = {
                    type: 'BlockStatement',
                    body: []
                };
                while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
                    node.alternate.body.push(parseStatement());
                }
                consume('RIGHT_CURLY');
            } else if (peek().type === 'IF') {
                node.alternate = parseIfStatement();
            } else {
                node.alternate = parseStatement();
            }
        }
        return node;
    }

    function forStatement() {
        const node = {
            type: 'ForStatement',
            init: null,
            test: null,
            update: null,
            body: null
        };
        consume('FOR');
        consume('LEFT_PAREN');

        // Parse initializer (can be variable declaration, any expression, or empty)
        if (peek().type === 'VAR' || peek().type === 'LET' || peek().type === 'CONST') {
            node.init = parseVariableDeclaration();
        } else if (peek().type !== 'SEMICOLON') {
            node.init = parseExpression();
        }
        consume('SEMICOLON');

        // Parse test (can be any expression or empty)
        if (peek().type !== 'SEMICOLON') {
            node.test = parseExpression();
        }
        consume('SEMICOLON');

        // Parse update (can be any expression or empty)
        if (peek().type !== 'RIGHT_PAREN') {
            node.update = parseExpression();
        }
        consume('RIGHT_PAREN');

        if (peek().type === 'LEFT_CURLY') {
            node.body = {
                type: 'BlockStatement',
                body: []
            };
            consume('LEFT_CURLY');
            while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
                node.body.body.push(parseStatement());
            }
            consume('RIGHT_CURLY');
        } else {
            node.body = parseStatement();
        }

        return node;
    }

    // Parse an array expression like '[1, 2 + 3, true]'
    function parseArray() {
        const node = {
            type: 'ArrayExpression',
            elements: []
        };
        consume('LEFT_BRACKET');

        while (peek().type !== 'RIGHT_BRACKET' && peek().type !== 'EOF') {
            const element = parseExpression();
            node.elements.push(element);
            if (peek().type === 'COMMA') {
                consume('COMMA');
            }
        }
        consume('RIGHT_BRACKET');
        return node;
    }
    function parseObject() {
        const node = {
            type: 'ObjectExpression',
            properties: []
        };
        consume('LEFT_CURLY');

        while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
            const property = {
                type: 'Property',
                key: consume('IDENTIFIER').value,
                value: null
            };
            if (peek().type === 'TERNARY') {
                consume('TERNARY');
                property.value = parseExpression();
            } else {
                throw new Error(`Expected ':' after property key at position ${peek().position}`);
            }
            node.properties.push(property);
            if (peek().type === 'COMMA') {
                consume('COMMA');
            }
        }
        consume('RIGHT_CURLY');
        return node;
    }
    
    // Parse an expression with precedence
    function parseExpression() {
        // Start parsing binary expressions with the lowest precedence (0)
        return parseBinaryExpression(0);
    }

    // Parse binary expressions with operator precedence
    function parseBinaryExpression(precedence) {
        // Parse the left-hand side of the expression (primary expression)
        let left = parsePrimaryExpression();
        // Continue parsing as long as there are operators with higher precedence
        while (true) {
            // Get the next token (potential operator)
            let operator = peek();
            // Get the precedence of the operator
            let currentPrecedence = getPrecedence(operator.type);

            // If the operator's precedence is lower or equal to the current precedence, stop parsing
            if (currentPrecedence < precedence) {
                break;
            }

            //If the token is not a supported binary operator, break the loop
            if ([
                'PLUS', 'MINUS', 'MULTIPLY', 'DIVIDE',
                'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_EQUALS', 'LESS_THAN_EQUALS',
                'EQUALS_EQUALS', 'NOT_EQUALS',
                'AND_AND', 'OR_OR'
            ].indexOf(operator.type) === -1) {
                break;
            }


            // Consume the operator
            consume(operator.type);
            // Parse the right-hand side of the expression with higher precedence
            let right = parseBinaryExpression(currentPrecedence + 1);

            // Create a binary expression node in the AST
            left = {
                type: 'BinaryExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        // Return the resulting expression
        return left;
    }

    // Parse primary expressions (literals, identifiers, objects)
    function parsePrimaryExpression() {
        let expression;
        const token = peek();
        if (token.type === 'NUMBER' || token.type === 'BOOLEAN') {
            expression = {
                type: 'Literal',
                value: consume(token.type).value
            };
        } else if (token.type === 'STRING') {
            expression = {
                type: 'Literal',
                value: consume('STRING').value
            };
        } else if (token.type === 'IDENTIFIER') {
            expression = {
                type: 'Identifier',
                name: consume('IDENTIFIER').value
            };
        } else if (token.type === 'LEFT_CURLY') {
            expression = parseObject();
        } else if (token.type === 'LEFT_BRACKET') {
            expression = parseArray();
        } else if (token.type === 'NULL') {
            consume('NULL');
            expression = { type: 'Literal', value: null };
        } else if (token.type === 'UNDEFINED') {
            consume('UNDEFINED');
            expression = { type: 'Literal', value: undefined };
        }else if(token.type=="COMMA"){
            consume('COMMA');
        }else if(token.type=="LEFT_PAREN") {
            consume('LEFT_PAREN');
            const args = [];
            while (peek().type !== 'RIGHT_PAREN' && peek().type !== 'EOF') {
                args.push(parseExpression());
                if (peek().type === 'COMMA') {
                    consume('COMMA');
                }
            }
            consume('RIGHT_PAREN');
            if(peek().type === 'ARROW_FUNCTION') {
                consume('ARROW_FUNCTION');
                if(peek().type === 'LEFT_CURLY') {
                    consume('LEFT_CURLY');
                    const body = [];
                    while (peek().type !== 'RIGHT_CURLY' && peek().type !== 'EOF') {
                        if (peek().type === 'RETURN') {
                            console.log(`Parsing return statement at position ${peek().position}`);
                            consume('RETURN');
                            body.push(parseStatement());
                        } else {
                            body.push(parseExpression());
                        }
                    }
                    consume('RIGHT_CURLY');
                    expression = {
                        type: 'ArrowFunctionExpression',
                        params: args,
                        body: {
                            type: 'BlockStatement',
                            body: body
                        }
                    };
                }
            }
        }
        else throw new Error(`Unexpected token type ${token.type} for expression at position ${token.position}`);

       if(peek().type === 'LEFT_PAREN') {
           consume('LEFT_PAREN');
           const args = [];
              while (peek().type !== 'RIGHT_PAREN' && peek().type !== 'EOF') {
                args.push(parseExpression());
              }
              consume('RIGHT_PAREN');
              expression = {
                  type: 'CallExpression',
                  callee: expression,
                  arguments: args
              };

       }
       while (peek().type === 'DOT'|| peek().type === 'LEFT_BRACKET') {
           if (peek().type === 'DOT') {
               consume('DOT');
               const property = consume('IDENTIFIER');
               expression = {
                   type: 'MemberExpression',
                   object: expression,
                   property: {
                       type: 'Identifier',
                       name: property.value
                   },
                   computed: false
               };
           } else if (peek().type === 'LEFT_BRACKET') {
               consume('LEFT_BRACKET');
               const index = parseExpression();
               consume('RIGHT_BRACKET');
               expression = {
                   type: 'MemberExpression',
                   object: expression,
                   property: index,
                     computed: true
               };
           }
       }
return expression;
    }

    // Get the precedence of a token type
    function getPrecedence(tokenType) {
        switch (tokenType) {
            case 'MULTIPLY':
            case 'DIVIDE':
                return 4; // Multiplicative operators
            case 'PLUS':
            case 'MINUS':
                return 3; // Additive operators
            case 'GREATER_THAN':
            case 'LESS_THAN':
            case 'GREATER_THAN_EQUALS':
            case 'LESS_THAN_EQUALS':
                return 2; // Comparison operators
            case 'EQUALS_EQUALS':
            case 'NOT_EQUALS':
                return 2; // Equality operators
            case 'AND_AND':
                return 1; // Logical AND
            case 'OR_OR':
                return 0; // Logical OR (lowest precedence)
            default:
                return -1; // Not a binary operator
        }
    }


    function parseComment() {
        const token = peek();
        if (token.type === 'COMMENT') {
            consume('COMMENT');
            return {
                type: 'Comment',
                value: token.value
            };
        }
        throw new Error(`Expected comment at position ${token.position}`);
    }
    return parseProgram();
}

module.exports = { parser };
