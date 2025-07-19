// Import the tokenizer function from toenizer.js
const { parser } = require('./parser.js');
const { tokenizer } = require('./toenizer.js');

// Sample input code to test the tokenizer
const sampleCode = `const arr[0]`

console.log(`Sample code length: ${sampleCode.length}`);

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
