const fs = require('fs');
let c = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');

c = c.replace(
  'className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white flex flex-col"',
  'className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white flex flex-col" style={{height:"100vh", position:"sticky", top:0}}'
);

fs.writeFileSync('src/components/SuperAdminLayout.tsx', c, 'utf8');
console.log('Done!');
