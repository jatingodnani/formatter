
const { tokenizer } = require('./toenizer.js');
const { parser } = require('./parser.js');
const { linter } = require('./linter.js');

const sourceCode = `
var x = 10;
let y = 20;
const z = 30;
`;

const tokens = tokenizer(sourceCode);
const ast = parser(tokens);
const warnings = linter(ast);

console.log('Linter Warnings:');
if (warnings.length === 0) {
    console.log('No issues found.');
} else {
    warnings.forEach(warning => {
        console.log(`- ${warning.message} (at position ${warning.position})`);
    });
}
