const fs = require('fs');
let c = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');

// Fix: make nav flex-1 and footer stick to bottom with no gap
c = c.replace(
  '<nav className="flex-1 p-2 space-y-1">',
  '<nav className="flex-1 p-2 space-y-1" style={{overflowY:"auto"}}>'
);

c = c.replace(
  '<Separator className="bg-purple-700" />\n\n        {/* Footer */}\n        <div className="p-4">',
  '<div className="p-4" style={{borderTop:"1px solid rgba(255,255,255,0.1)", marginTop:"auto"}}>'
);

fs.writeFileSync('src/components/SuperAdminLayout.tsx', c, 'utf8');
console.log('Done!');
