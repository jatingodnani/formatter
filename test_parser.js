// Import the parser and tokenizer functions
const { parser } = require('./parser.js');
const { tokenizer } = require('./toenizer.js');

// Sample input code to test the parser with an object expression
const sampleCode = `const jatin=(a,b) => {
  return 1}`;

// Function to run the test
function runTest() {
  console.log('Testing parser with object expression...');
  console.log('Sample code:');
  console.log(sampleCode);
  
  try {
    // Tokenize the sample code
    const tokens = tokenizer(sampleCode);
    console.log('Tokens generated:', tokens);
    
    // Parse the tokens into an AST
    const ast = parser(tokens);
    console.log('AST generated:', JSON.stringify(ast, null, 2));
    
    // Check if the object expression was parsed correctly
    const declaration = ast.body[0];
    if (declaration.type === 'VariableDeclaration' && 
        declaration.initializer && 
        declaration.initializer.type === 'ObjectExpression') {
      console.log('Success: Object expression parsed correctly.');
      console.log('Object properties:', declaration.initializer.properties);
    } else {
      console.error('Failure: Object expression not found or parsed incorrectly in AST.');
    }
  } catch (error) {
    console.error('Error during tokenization or parsing:', error.message);
    const errorPosition = parseInt(error.message.match(/position (\d+)/)?.[1] || -1);
    if (errorPosition >= 0) {
      const snippet = sampleCode.slice(Math.max(0, errorPosition - 10), errorPosition + 10);
      console.error(`Context around position ${errorPosition}: ...${snippet}...`);
      console.error(`Character at position ${errorPosition}: ${sampleCode[errorPosition] || 'N/A'}`);
    }
  }
}

// Execute the test
runTest();

module.exports = { runTest };
