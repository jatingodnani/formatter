// test_formatter.js
const { parser } = require('./parser');
const { tokenizer } = require('./toenizer');
const { format, defaultSettings } = require('./formatter');

const testCases = [
  // {
  //   name: 'Simple variable',
  //   code: 'const x=1',
  // },
  // {
  //   name: 'Arrow function concise',
  //   code: 'const f = (a, b)=>a+b',
  // },
  // {
  //   name: 'Arrow function block',
  //   code: 'const f = (a, b) => { return a + b; }',
  // },
  // {
  //   name: 'Grouped expression',
  //   code: 'const y = (2+3)*4',
  // },
  // {
  //   name: 'If statement',
  //   code: 'if(x>0){return 1}else{return 2}',
  // // },
  // {
  //   name: 'For loop',
  //   code: 'for(let i=0;i<10;i=i+1){x=x+i}',
  // },
  // {
  //   name: 'Object and array',
  //   code: 'const obj = {a:1, b:2} const arr = [1, 2, 3]',
  // },
  // {
  //   name: 'Function declaration',
  //   code: 'function foo(a,b){return a*b;}'
  // },
  {
    name: 'Call and member',
    code: 'foo(1,2)'
  },
];

function runFormatterTests() {
  for (const { name, code } of testCases) {
    try {
      console.log('---');
      console.log('Test:', name);
      console.log('Input code:', code);
      const tokens = tokenizer(code);
      const ast = parser(tokens);
      console.log('Parsed AST:', JSON.stringify(ast, null, 2));
      const formatted = format(ast, { indent: 2, spaceAroundOperators: true });
      console.log('Formatted output:\n' + formatted);
    } catch (e) {
      console.error('Error in test', name, ':', e.message);
    }
  }
}

if (require.main === module) {
  runFormatterTests();
}

module.exports = { runFormatterTests };
