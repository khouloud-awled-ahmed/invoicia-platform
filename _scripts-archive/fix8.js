const fs = require('fs');
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');

s = s.replace(
  `    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside style={{width:"256px", background:"linear-gradient(to bottom, #4c1d95, #3730a3)", color:"white", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0}}>`,
  `    <div style={{display:"flex", minHeight:"100vh", background:"linear-gradient(135deg, #faf5ff, white, #faf5ff)"}}>
      <aside style={{width:"256px", background:"linear-gradient(to bottom, #581c87, #4338ca)", color:"white", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0}}>`
);

fs.writeFileSync('src/components/SuperAdminLayout.tsx', s, 'utf8');
console.log('Done!');
