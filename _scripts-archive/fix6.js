const fs = require('fs');

// Fix MainLayout - force sidebar height
let c = fs.readFileSync('src/components/MainLayout.tsx', 'utf8');
c = c.replace(
  'width: "240px", flexShrink: 0, background: "white",\n            display: "flex", flexDirection: "column",\n            borderRight: "1px solid #f3f4f6", boxShadow: "2px 0 8px rgba(0,0,0,0.04)"',
  'width: "240px", flexShrink: 0, background: "white",\n            display: "flex", flexDirection: "column",\n            height: "100vh", position: "sticky", top: 0,\n            borderRight: "1px solid #f3f4f6", boxShadow: "2px 0 8px rgba(0,0,0,0.04)"'
);
fs.writeFileSync('src/components/MainLayout.tsx', c, 'utf8');

// Fix SuperAdmin - check current nav state
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');
let idx = s.indexOf('Quitter');
console.log('SuperAdmin around Quitter:', JSON.stringify(s.substring(idx-400, idx+100)));

console.log('MainLayout Done!');
