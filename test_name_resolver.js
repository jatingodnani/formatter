/**
 * Test file for name resolution functionality
 */

const { tokenizer } = require('./toenizer.js');
const { parser } = require('./parser.js');
const { nameResolver } = require('./nameResolver.js');
const { linter } = require('./linter.js');

// Sample code with various scoping and variable usage scenarios
const sampleCode = `
// Global scope variables
const globalConst = 10;
let globalLet = 20;
var globalVar = 30;

// Unused global
const unusedGlobal = 40;

// Function with parameters and local variables
function testFunction(param1, param2) {
  const localConst = param1 + param2;
  let localLet = localConst * 2;
  
  // Using variables from outer scope
  console.log(globalConst, globalLet);
  
  // Unused local
  const unusedLocal = 50;
  
  // Block scope
  {
    const blockConst = 60;
    let blockLet = 70;
    console.log(blockConst, localLet);
  }
  
  // Reference to undefined variable
  console.log(undefinedVar);
  
  return localLet;
}

// Arrow function
const arrowFunc = (a, b) => {
  const result = a + b + globalLet;
  return result;
};

// Nested functions with shadowing
function outer() {
  const x = 100;
  
  function inner() {
    const x = 200; // Shadows outer x
    console.log(x); // Should refer to inner x
  }
  
  inner();
  console.log(x); // Should refer to outer x
}
`;

// Run the test
function runTest() {
  console.log('Testing name resolution...');
  console.log('Sample code:');
  console.log(sampleCode);
  
  try {
    // Tokenize and parse the code
    const tokens = tokenizer(sampleCode);
    const ast = parser(tokens);
    
    // Run name resolution
    const nameResults = nameResolver(ast);
    
    // Display results
    console.log('\nName Resolution Results:');
    
    // Symbol tables
    console.log('\nSymbol Tables:');
    Object.keys(nameResults.symbolTables).forEach(scopeId => {
      const scope = nameResults.symbolTables[scopeId];
      console.log(`\nScope: ${scopeId} (Parent: ${scope.parent || 'none'})`);
      
      const symbols = scope.symbols;
      if (Object.keys(symbols).length === 0) {
        console.log('  No symbols in this scope');
      } else {
        Object.keys(symbols).forEach(name => {
          const symbol = symbols[name];
          console.log(`  ${name}: ${symbol.type} (references: ${symbol.references})`);
        });
      }
    });
    
    // Undefined variables
    console.log('\nUndefined Variables:');
    if (nameResults.undefinedVariables.length === 0) {
      console.log('  None');
    } else {
      nameResults.undefinedVariables.forEach(item => {
        console.log(`  ${item.name} at position ${item.position || 'unknown'}`);
      });
    }
    
    // Unused variables
    console.log('\nUnused Variables:');
    if (nameResults.unusedVariables.length === 0) {
      console.log('  None');
    } else {
      nameResults.unusedVariables.forEach(item => {
        console.log(`  ${item.name} in scope ${item.scopeId} at position ${item.position || 'unknown'}`);
      });
    }
    
    // Run linter to see integrated warnings
    console.log('\nLinter Warnings:');
    const warnings = linter(ast);
    if (warnings.length === 0) {
      console.log('  No issues found.');
    } else {
      warnings.forEach(warning => {
        console.log(`  - ${warning.message} (at position ${warning.position || 'unknown'})`);
      });
    }
    
  } catch (error) {
    console.error('Error during test:', error.message);
    console.error(error.stack);
  }
}

// Run the test
runTest();

module.exports = { runTest };
