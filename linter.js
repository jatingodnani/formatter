
function linter(ast) {
    const warnings = [];
    const { nameResolver } = require('./nameResolver.js');
    
    // Run name resolution to get symbol tables and issues
    const nameResolution = nameResolver(ast);
    
    // Add name resolution warnings
    
    // Undefined variables
    nameResolution.undefinedVariables.forEach(item => {
        warnings.push({
            message: `Undefined variable: '${item.name}'`,
            position: item.position
        });
    });
    
    // Unused variables
    nameResolution.unusedVariables.forEach(item => {
        warnings.push({
            message: `Unused variable: '${item.name}'`,
            position: item.position
        });
    });

    function traverse(node, parent) {
        // Rule: Disallow 'var'
        if (node.type === 'VariableDeclaration' && node.kind === 'var') {
            warnings.push({
                message: "'var' is not allowed, use 'let' or 'const' instead.",
                position: node.position // We'll need to make sure position info is in the AST
            });
        }

        for (const key in node) {
            if (node.hasOwnProperty(key)) {
                const child = node[key];
                if (typeof child === 'object' && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach(item => traverse(item, node));
                    } else {
                        traverse(child, node);
                    }
                }
            }
        }
    }

    traverse(ast, null);
    return warnings;
}

module.exports = { linter };
