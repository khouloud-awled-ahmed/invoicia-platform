const fs = require('fs');
// Search for the dark sidebar - who renders "Clients", "Offres & Packs", "Paramètres"
let files = ['src/components/SuperAdminLayout.tsx', 'src/components/PlatformLayout.tsx'];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if(c.includes('Offres & Packs') || c.includes('Offres')) {
    console.log('FOUND IN:', f);
    let idx = c.indexOf('Offres');
    console.log(JSON.stringify(c.substring(idx-100, idx+100)));
  }
});
