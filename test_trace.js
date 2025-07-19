const { parser } = require('./parser');

// Simple tokenizer to create tokens for testing
function tokenize(input) {
    const tokens = [];
    let i = 0;

    while (i < input.length) {
        const char = input[i];

        if (char === ' ') {
            i++;
            continue;
        }

        if (char >= '0' && char <= '9') {
            tokens.push({ type: 'NUMBER', value: parseInt(char), position: i });
        } else if (char === '+') {
            tokens.push({ type: 'PLUS', value: '+', position: i });
        } else if (char === '-') {
            tokens.push({ type: 'MINUS', value: '-', position: i });
        } else if (char === '*') {
            tokens.push({ type: 'MULTIPLY', value: '*', position: i });
        } else if (char === '/') {
            tokens.push({ type: 'DIVIDE', value: '/', position: i });
        }

        i++;
    }

    tokens.push({ type: 'EOF', value: null, position: i });
    return tokens;
}

// Test with different expressions
console.log('=== Testing: 2 + 3 * 4 ===');
const tokens1 = tokenize('2 + 3 * 4');
console.log('Tokens:', tokens1);

try {
    const ast1 = parser(tokens1);
    console.log('AST:', JSON.stringify(ast1, null, 2));
} catch (error) {
    console.log('Error:', error.message);
}

console.log('\n=== Testing: 2 * 3 + 4 ===');
const tokens2 = tokenize('2 * 3 + 4');
console.log('Tokens:', tokens2);

try {
    const ast2 = parser(tokens2);
    console.log('AST:', JSON.stringify(ast2, null, 2));
} catch (error) {
    console.log('Error:', error.message);
}
