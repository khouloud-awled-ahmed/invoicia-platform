import subprocess
result = subprocess.run(['node', '-e', 'const bcrypt = require("bcrypt"); bcrypt.hash("Admin123!", 10).then(h => console.log(h))'], capture_output=True, text=True, cwd='backend')
print(result.stdout.strip())
