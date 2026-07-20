const fs = require('fs');
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');
let idx = s.indexOf('<nav');
console.log(JSON.stringify(s.substring(idx, idx+100)));
