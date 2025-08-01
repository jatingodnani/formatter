
const TOKEN_PATTERNS = [

    {type:"COMMENT", regex:/^\/\/.*/},// Single-line comment
    { type: "COMMENT", regex: /^\/\*[\s\S]*?\*\// } , // Multi-line comment

    //keywords

    {type:"CONST", regex:/^const\b/},
    {type:"LET", regex:/^let\b/},
    {type:"VAR", regex:/^var\b/},
  { type: "RETURN", regex: /^return\b/ }, // return key
  {type:"IF", regex:/^if\b/}, // if key
  { type: "ELSE", regex: /^else\b/ }, // else key


   //Type annotations
   { type: "TYPE_NUMBER", regex: /^number\b/ }, // TypeScript's number type
  { type: "TYPE_STRING", regex: /^string\b/ }, // TypeScript's string type
  { type: "TYPE_BOOLEAN", regex: /^boolean\b/ }, // TypeScript's boolean type
  { type: "TYPE_ARRAY", regex: /^Array\b/ }, // Array type
  { type: "TYPE_VOID", regex: /^void\b/ }, // Void type
  { type: "TYPE_INT", regex: /^Void\b/ }, // Our Void type
  { type: "TYPE_FLOAT", regex: /^Float\b/ }, // Our Float type
  { type: "TYPE_BOOL", regex: /^Bool\b/ }, // Our Bool type
  { type: "TYPE_UNIT", regex: /^Unit\b/ }, // Our Unit type

{ type: "NULL", regex: /^null\b/ }, // JS null literal
{ type: "UNDEFINED", regex: /^undefined\b/ }, // JS undefined literal
{ type: "BOOLEAN", regex: /^true\b/ }, // JS true literal
{ type: "BOOLEAN", regex: /^false\b/ }, // JS false literal
{type:"ARROW_FUNCTION", regex:/^=>/},
    {type:"PLUS", regex:/^\+/}, // Plus operator
    {type:"MINUS", regex:/^\-/}, // Minus operator
    {type:"MULTIPLY", regex:/^\*/}, // Multiply operator
    {type:"DIVIDE", regex:/^\//}, // Divide operator
    {type:"EQUALS", regex:/^=/}, // Equals operator
    {type:"EQUALS_EQUALS", regex:/^==/}, // Equals equals operator
    {type:"NOT_EQUALS", regex:/^!=/}, // Not equals operator
    {type:"GREATER_THAN", regex:/^>/}, // Greater than operator
    {type:"LESS_THAN", regex:/^</}, // Less than operator
    {type:"GREATER_THAN_EQUALS", regex:/^>=/}, // Greater than or equals operator
    {type:"LESS_THAN_EQUALS", regex:/^<=/}, // Less than or equals operator
    {type:"ARROW", regex:/^=>/}, // Arrow function
    {type:"TERNARY", regex:/^:/}, // Ternary operator
    {type:"FUNCTION", regex:/^function\b/}, // Function keyword
    { type: "LEFT_PAREN", regex: /^\(/ }, // (
  { type: "RIGHT_PAREN", regex: /^\)/ }, // )
  { type: "LEFT_CURLY", regex: /^\{/ }, // {
  { type: "RIGHT_CURLY", regex: /^\}/ }, // }
  { type: "LEFT_BRACKET", regex: /^\[/ }, // [
  { type: "RIGHT_BRACKET", regex: /^\]/ }, // ]
{type:"FOR", regex:/^for\b/}, // for keyword
    {type:"IDENTIFIER", regex:/^[a-zA-Z_][a-zA-Z0-9_]*/}, // Identifier (variable names, function names, etc.)
    {type:"NUMBER", regex:/^\d+(\.\d+)?/}, // Number (integer or float)
    {type:"STRING", regex:/^"(?:\\.|[^"\\])*"/}, // String literal (double-quoted)
    {type:"STRING", regex:/^'(?:\\.|[^'\\])*'/}, // String literal (single-quoted)
    {type:"COMMENT", regex:/^\/\/.*/}, // Single-line comment
    {type:"COMMENT", regex:/^\/\*[\s\S]*?\*\//}, // Multi-line comment
    {type:"SEMICOLON", regex:/^;/}, // Semicolon
    {type:"COMMA", regex:/^,/}, // Comma
    {type:"COLON", regex:/^:/}, // Colon
    {type:"DOT", regex:/^\./}, // Dot (for member access)
    {type:"INCREMENT", regex:/^\+\+/}, // Increment operator
    {type:"DECREMENT", regex:/^--/},
]


function tokenizer(sourceCode) {
   
    const tokens = [];
    let position = 0;


    function skipWhitespace() {
    const match = sourceCode.slice(position).match(/^\s+/);
    if (match) {
      const whitespaceText = match[0];
      position += whitespaceText.length;
    }
  }


  while(position<sourceCode.length) {
    
  skipWhitespace();

    if (position >= sourceCode.length) {
        break;
    }

    let matched = false;
    for (const pattern of TOKEN_PATTERNS) {
      const match = sourceCode.slice(position).match(pattern.regex);
      
      if (match) {

        if(pattern.type === "COMMENT") {
          // For comments, we skip the matched text and do not add it to tokens
          position += match[0].length;
          matched = true;
          break; // Exit the loop after skipping the comment
        }
        const token = {
          type: pattern.type,
          value: match[0],
          position: position
        };
        tokens.push(token);
        position += match[0].length;
        matched = true;
        break; // Exit the loop after the first match
      }
    }

    if (!matched) {
      throw new Error(`Unexpected token at position ${position}`);
    }
  }
  tokens.push({
    type: "EOF",
    position: position,
  });


  return tokens;
}

module.exports = { tokenizer };
