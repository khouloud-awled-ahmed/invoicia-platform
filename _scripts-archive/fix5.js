const fs = require('fs');
let c = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');

c = c.replace(
  `<aside className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white flex flex-col" style={{height:"100vh", position:"sticky", top:0}}>`,
  `<aside style={{width:"256px", background:"linear-gradient(to bottom, #4c1d95, #3730a3)", color:"white", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0}}>`
);

c = c.replace(
  'className="p-2 space-y-1"',
  'style={{flex:1, padding:"8px", display:"flex", flexDirection:"column", gap:"4px"}}'
);

fs.writeFileSync('src/components/SuperAdminLayout.tsx', c, 'utf8');
console.log('Done!');
