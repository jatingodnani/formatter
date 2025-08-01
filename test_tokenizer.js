// Import the tokenizer function from toenizer.js
const { parser } = require('./parser.js');
const { tokenizer } = require('./toenizer.js');

// Sample input code to test the tokenizer
const sampleCode = `const arr[0]`

console.log(`Sample code length: ${sampleCode.length}`);

// Additional test for let/var/const keyword tokenization
const keywordTest = 'let x = 1; var y = 2; const z = 3;';
console.log('---');
console.log('Testing keyword tokenization:');
console.log('Input:', keywordTest);
const keywordTokens = tokenizer(keywordTest);
console.log('Tokens:', keywordTokens.map(t => ({type: t.type, value: t.value})));

// Run the tokenizer on the sample code
try {
  const tokens = tokenizer(sampleCode);

  console.log(parser(tokens));
} catch (error) {
  console.error('Error during tokenization:', error.message);
  const errorPosition = parseInt(error.message.match(/position (\d+)/)?.[1] || -1);
  if (errorPosition >= 0) {
    const snippet = sampleCode.slice(Math.max(0, errorPosition - 10), errorPosition + 10);
    console.error(`Context around position ${errorPosition}: ...${snippet}...`);
    console.error(`Character at position ${errorPosition}: ${sampleCode[errorPosition] || 'N/A'}`);
  }
}
