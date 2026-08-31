const fs = require("fs");
const path = "C:\\Users\\k\\Desktop\\invocia-platform\\invocia -TN\\src\\lib\\api-client-backend.ts";
let content = fs.readFileSync(path, "utf8");
// Strip BOM and any replacement characters at the very start
content = content.replace(/^\uFEFF/, "");
content = content.replace(/^\uFFFD+/, "");
fs.writeFileSync(path, content, "utf8");
console.log("First 20 chars:", JSON.stringify(content.slice(0, 20)));
