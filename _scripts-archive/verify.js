const fs = require('fs');
let c = fs.readFileSync('src/components/PlatformLayout.tsx', 'utf8');
let idx = c.indexOf('100vh');
console.log('Found 100vh:', idx !== -1);
console.log(JSON.stringify(c.substring(idx-60, idx+150)));

let idx2 = c.indexOf('marginTop');
console.log('Found marginTop:', idx2 !== -1);
console.log(JSON.stringify(c.substring(idx2-80, idx2+50)));
