const fs = require('fs');
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');

// Check exact current aside opening tag
let idx = s.indexOf('<aside');
console.log(JSON.stringify(s.substring(idx, idx+200)));
