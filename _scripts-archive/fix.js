const fs = require('fs');
let c = fs.readFileSync('src/components/MainLayout.tsx', 'utf8');
c = c.replace(
  'display: "flex", alignItems: "center", gap: "10px" }}>',
  'display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "10px", background: "white", boxShadow: "0 1px 4px rgba(109,40,217,0.08)", border: "1px solid #f0f0f5" }}>'
);
c = c.replace(
  'fontSize: "10px", color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"',
  'fontSize: "10px", color: "#a78bfa", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500"'
);
fs.writeFileSync('src/components/MainLayout.tsx', c, 'utf8');
console.log('Done!');
