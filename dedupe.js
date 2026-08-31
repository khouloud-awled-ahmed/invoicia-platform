const fs = require('fs');
const path = "C:\\Users\\k\\Desktop\\invocia-platform\\invocia -TN\\src\\lib\\api-client-backend.ts";
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const seen = new Set();
const output = [];
let skipping = false;
let braceDepth = 0;
let skipStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^\s*async (\w+)\(/);
  
  if (match && !skipping) {
    const name = match[1];
    if (seen.has(name)) {
      // Start skipping this duplicate function block
      skipping = true;
      braceDepth = 0;
      // count braces on this line
      for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      if (braceDepth <= 0) skipping = false; // one-liner function
      continue;
    } else {
      seen.add(name);
    }
  } else if (skipping) {
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth <= 0) {
      skipping = false;
    }
    continue;
  }
  
  output.push(line);
}

fs.writeFileSync(path, output.join('\n'), 'utf8');
console.log('Done. New line count:', output.length);
