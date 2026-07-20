const fs = require('fs');
let c = fs.readFileSync('src/components/PlatformLayout.tsx', 'utf8');

c = c.replace(
  '<aside className="w-64 bg-gray-900 text-white flex flex-col">',
  '<aside className="w-64 bg-gray-900 text-white flex flex-col" style={{height:"100vh", position:"sticky", top:0}}>'
);

c = c.replace(
  '<div className="p-4 border-t border-gray-800">',
  '<div className="p-4 border-t border-gray-800" style={{marginTop:"auto"}}>'
);

fs.writeFileSync('src/components/PlatformLayout.tsx', c, 'utf8');
console.log('Done!');
