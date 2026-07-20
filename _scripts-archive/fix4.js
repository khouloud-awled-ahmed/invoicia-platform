const fs = require('fs');
let c = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');

c = c.replace(
  'className="flex-1 p-2 space-y-1" style={{overflowY:"auto"}}',
  'className="p-2 space-y-1"'
);

fs.writeFileSync('src/components/SuperAdminLayout.tsx', c, 'utf8');
console.log('Done!');
