const fs = require('fs');
const path = "C:\\Users\\k\\Desktop\\invocia-platform\\invocia -TN\\src\\lib\\api-client-backend.ts";
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

const seen = new Set();
const output = [];
let skipping = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  const isComment = trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*');
  const match = !isComment ? line.match(/^\s{2}async (\w+)\(/) : null;

  if (match && !skipping) {
    const name = match[1];
    if (seen.has(name)) {
      skipping = true;
      braceDepth = 0;
      for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      if (braceDepth <= 0) skipping = false;
      continue;
    } else {
      seen.add(name);
    }
  } else if (skipping) {
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth <= 0) skipping = false;
    continue;
  }

  output.push(line);
}

fs.writeFileSync(path, output.join('\n'), { encoding: 'utf8' });
console.log('Done. New line count:', output.length);
