const fs = require('fs');
let c = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');
let idx = c.indexOf('Quitter');
console.log(JSON.stringify(c.substring(idx-300, idx+200)));
