const fs = require('fs');

// Fix SuperAdmin - add flex:1 back to nav
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');
s = s.replace(
  'style={{flex:1, padding:"8px", display:"flex", flexDirection:"column", gap:"4px"}}',
  'style={{flex:1, padding:"8px", overflowY:"auto"}}'
);
fs.writeFileSync('src/components/SuperAdminLayout.tsx', s, 'utf8');

console.log('Done!');
