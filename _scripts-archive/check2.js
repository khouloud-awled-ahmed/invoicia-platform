const fs = require('fs');
let c = fs.readFileSync('src/components/MainLayout.tsx', 'utf8');
let idx = c.indexOf('User */}');
console.log(JSON.stringify(c.substring(idx, idx+600)));
