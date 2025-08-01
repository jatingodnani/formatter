// Import the parser and tokenizer functions
const { parser } = require('./parser.js');
const { tokenizer } = require('./toenizer.js');

// Sample input code to test the parser with an object expression
const sampleCode = `foo(a,b)`;

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
    
    // Check for all three for-loop variable declarations
    const forStatements = ast.body.filter(stmt => stmt.type === 'ForStatement');
    for (const forStmt of forStatements) {
      if (forStmt.init && forStmt.init.type === 'VariableDeclaration') {
        console.log(`For loop with kind: ${forStmt.init.kind}`);
        if (!["let", "var", "const"].includes(forStmt.init.kind)) {
          console.error('Failure: Unexpected kind in for loop variable declaration:', forStmt.init.kind);
        } else {
          console.log('Success: Correct kind in for loop variable declaration.');
        }
      } else {
        console.error('Failure: No variable declaration found in for loop initializer.');
      }
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
