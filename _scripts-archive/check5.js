const fs = require('fs');
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');
let idx = s.indexOf('Separator');
while(idx !== -1) {
  console.log(idx, JSON.stringify(s.substring(idx, idx+60)));
  idx = s.indexOf('Separator', idx+1);
}
