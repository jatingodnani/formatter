/**
 * Name resolver for JavaScript AST
 * Builds symbol tables and resolves variable references across scopes
 */

function nameResolver(ast) {
  // Results object to store findings
  const results = {
    undefinedVariables: new Set(),
    unusedVariables: new Set(),
    symbolTables: {},
    variableInfo: new Map()
  };

  // Stack to track nested scopes
  const scopeStack = [{ id: 'global', symbols: new Map(), parent: null }];
  let currentScope = scopeStack[0];
  let scopeCounter = 1; // For generating unique scope IDs

  // Helper to create a new scope
  function enterScope(type) {
    const scopeId = `${type}_${scopeCounter++}`;
    const newScope = {
      id: scopeId,
      symbols: new Map(),
      parent: currentScope.id
    };
    
    scopeStack.push(newScope);
    currentScope = newScope;
    results.symbolTables[scopeId] = newScope;
    return scopeId;
  }

  // Helper to exit the current scope
  function exitScope() {
    // Check for unused variables before exiting scope
    currentScope.symbols.forEach((symbol, name) => {
      if (symbol.type === 'variable' && symbol.references === 0) {
        results.unusedVariables.add({
          name,
          scopeId: currentScope.id,
          position: symbol.position
        });
      }
    });
    
    scopeStack.pop();
    currentScope = scopeStack[scopeStack.length - 1];
  }

  // Helper to declare a symbol in the current scope
  function declareSymbol(name, type, node) {
    if (currentScope.symbols.has(name)) {
      // Symbol already declared in this scope
      return false;
    }
    
    currentScope.symbols.set(name, {
      type,
      references: 0,
      position: node.position || null
    });
    
    // Track variable info for later use
    if (!results.variableInfo.has(name)) {
      results.variableInfo.set(name, []);
    }
    
    results.variableInfo.get(name).push({
      scopeId: currentScope.id,
      isDeclared: true,
      position: node.position || null
    });
    
    return true;
  }

  // Helper to resolve a reference to a symbol
  function resolveReference(name, node) {
    // Look for the symbol in the current scope and parent scopes
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      const scope = scopeStack[i];
      if (scope.symbols.has(name)) {
        const symbol = scope.symbols.get(name);
        symbol.references++;
        
        // Track reference info
        if (!results.variableInfo.has(name)) {
          results.variableInfo.set(name, []);
        }
        
        results.variableInfo.get(name).push({
          scopeId: scope.id,
          isDeclared: false,
          position: node.position || null
        });
        
        return true;
      }
    }
    
    // Symbol not found in any accessible scope
    results.undefinedVariables.add({
      name,
      position: node.position || null
    });
    
    return false;
  }

  // Main traversal function
  function traverse(node, parent) {
    if (!node || typeof node !== 'object') return;

    // Handle different node types
    switch (node.type) {
      case 'Program':
        // Program is the global scope
        results.symbolTables['global'] = currentScope;
        break;
        
      case 'FunctionDeclaration':
        // Declare function name in current scope
        declareSymbol(node.id.name, 'function', node);
        
        // Create new scope for function body
        const funcScopeId = enterScope('function');
        
        // Add parameters to function scope
        if (node.params) {
          node.params.forEach(param => {
            if (param.type === 'Identifier') {
              declareSymbol(param.name, 'parameter', param);
            }
          });
        }
        
        // Process function body
        traverse(node.body, node);
        
        // Exit function scope
        exitScope();
        return; // Skip default traversal
        
      case 'ArrowFunctionExpression':
        // Create new scope for arrow function
        const arrowScopeId = enterScope('arrow');
        
        // Add parameters to function scope
        if (node.params) {
          node.params.forEach(param => {
            if (param.type === 'Identifier') {
              declareSymbol(param.name, 'parameter', param);
            }
          });
        }
        
        // Process function body
        traverse(node.body, node);
        
        // Exit function scope
        exitScope();
        return; // Skip default traversal
        
      case 'BlockStatement':
        // Create new scope for block
        if (parent.type !== 'FunctionDeclaration' && parent.type !== 'ArrowFunctionExpression') {
          const blockScopeId = enterScope('block');
          
          // Process block contents
          if (node.body) {
            node.body.forEach(item => traverse(item, node));
          }
          
          // Exit block scope
          exitScope();
          return; // Skip default traversal
        }
        break;
        
      case 'VariableDeclaration':
        // Process variable declarations
        if (node.declarations) {
          node.declarations.forEach(decl => {
            if (decl.id && decl.id.type === 'Identifier') {
              // Declare the variable in the current scope
              declareSymbol(decl.id.name, 'variable', decl);
              
              // Process initializer if present
              if (decl.init) {
                traverse(decl.init, decl);
              }
            }
          });
        }
        return; // Skip default traversal
        
      case 'Identifier':
        // Skip identifiers that are part of declarations (already handled)
        if (parent.type === 'VariableDeclarator' && parent.id === node) {
          return;
        }
        if (parent.type === 'FunctionDeclaration' && parent.id === node) {
          return;
        }
        if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) {
          return; // Skip property names in member expressions
        }
        
        // Resolve reference to identifier
        resolveReference(node.name, node);
        return; // Skip default traversal
    }

    // Default traversal for other node types
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

  // Start traversal from the root
  traverse(ast, null);

  return results;
}

module.exports = { nameResolver };
