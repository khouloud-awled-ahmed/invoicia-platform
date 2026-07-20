const fs = require('fs');
let s = fs.readFileSync('src/components/SuperAdminLayout.tsx', 'utf8');
let idx = s.indexOf('marginTop');
while(idx !== -1) {
  console.log(JSON.stringify(s.substring(idx-20, idx+40)));
  idx = s.indexOf('marginTop', idx+1);
}
